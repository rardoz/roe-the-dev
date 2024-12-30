import { connectDB } from '../../../lib/mongoose-db'
import PageLock from '../../../models/page-lock'
import Sketch from '../../../models/sketch'

const generateCode = (): string => {
  const min = 0
  const max = 9999
  const random = Math.floor(Math.random() * (max - min + 1) + min)
  return random.toString().padStart(4, '0')
}
/**
 * @swagger
 * /api/page-lock:
 *   post:
 *     tags:
 *       - Page Locks
 *     summary: Create a new page lock
 *     description: Creates a new sketch with a lock and generates a 4-digit access code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - page_number
 *             properties:
 *               page_number:
 *                 type: number
 *                 description: The page number to lock
 *                 example: 1
 *     responses:
 *       200:
 *         description: Lock created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 lock_id:
 *                   type: string
 *                   example: "676f659d749142a2f379bc9f"
 *                 code:
 *                   type: string
 *                   pattern: '^\d{4}$'
 *                   example: "2085"
 *       400:
 *         description: Bad request - missing page number
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "A page number is required"
 */
interface PostRequestBody {
  page_number: number
}

interface PostSuccessResponse {
  lock_id: string
  code: string
}

interface PostErrorResponse {
  success: false
  message: string
}

interface PopulatedSketchDoc {
  _id: string
  page_number: number
}

interface PopulatedPageLock {
  sketch_doc: PopulatedSketchDoc | null
}

export async function POST(req: Request): Promise<Response> {
  try {
    const data = (await req.json()) as PostRequestBody

    if (!data.page_number) {
      return Response.json(
        {
          success: false,
          message: 'A page number is required',
        } as PostErrorResponse,
        { status: 400 },
      )
    }

    await connectDB()
    const existingLock = await PageLock.find<PopulatedPageLock>().populate({
      path: 'sketch_doc',
      match: { page_number: data.page_number },
    })

    if (existingLock?.filter((lock) => lock.sketch_doc?._id).length) {
      return Response.json(
        {
          success: false,
          message: 'Lock already exists!',
        } as PostErrorResponse,
        { status: 400 },
      )
    }

    const code = generateCode()
    const newSketch = await Sketch.create({
      page_number: data.page_number,
      path: ' ',
      is_enabled: false,
    })

    const now = new Date()
    const lock = new PageLock({
      code,
      startTime: now,
      endTime: new Date(now.getTime() + 60 * 60 * 1000), // 60 minutes in milliseconds,
      sketch_doc: newSketch,
    })

    const savedLock = await lock.save()

    return Response.json({
      lock_id: savedLock._id,
      code: savedLock.code,
    } as PostSuccessResponse)
  } catch (e: any) {
    return Response.json(
      {
        success: false,
        message: e.message,
      } as PostErrorResponse,
      { status: 500 },
    )
  }
}
/**
 * @swagger
 * /api/page-lock:
 *   get:
 *     tags:
 *       - Page Locks
 *     summary: Get lock status for multiple pages
 *     description: Returns lock status for requested page numbers
 *     parameters:
 *       - in: query
 *         name: page_number
 *         required: true
 *         schema:
 *           type: array
 *           items:
 *             type: number
 *         style: form
 *         explode: true
 *         description: Page numbers to check (can be multiple)
 *         example: [1,2,3]
 *     responses:
 *       200:
 *         description: Lock status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 page_lock_status:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "123abc"
 *                       page_number:
 *                         type: number
 *                         example: 1
 *                       locked:
 *                         type: boolean
 *                         example: true
 *                       end_time:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-12-29T03:44:42.626Z"
 *       400:
 *         description: Bad request - missing or invalid page numbers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Page numbers are required!"
 */
interface PageLockStatus {
  page_number: number
  locked: boolean
  end_time: Date | undefined
}

interface PageLockStatusResponse {
  page_lock_status: PageLockStatus[]
}

interface PopulatedPageLockLight {
  _id: string
  endTime: Date
  sketch_doc: {
    page_number: number
  } | null
}

export async function GET(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url)
  const pageNumbers = searchParams.getAll('page_number')

  if (!pageNumbers.length) {
    return Response.json(
      { success: false, message: 'Page numbers are required!' },
      { status: 400 },
    )
  }

  const cleanPageNumbers = pageNumbers
    .map((num) => parseInt(num, 10))
    .filter((num) => num > 0)

  if (cleanPageNumbers.length !== pageNumbers.length) {
    return Response.json(
      { success: false, message: 'Invalid page numbers set!' },
      { status: 400 },
    )
  }

  await connectDB()
  const existingLocks = await PageLock.find<PopulatedPageLockLight>()
    .select('endTime sketch_doc')
    .populate({
      path: 'sketch_doc',
      select: 'page_number',
      match: { page_number: { $in: cleanPageNumbers } },
    })

  const response: PageLockStatusResponse = {
    page_lock_status: cleanPageNumbers.map((page_number) => {
      const found = existingLocks.find(
        (lock) => lock.sketch_doc?.page_number === page_number,
      )
      const endTime = found?.endTime
      const id = found?._id
      return {
        page_number,
        locked: !!endTime,
        end_time: endTime,
        id,
      }
    }),
  }

  return Response.json(response)
}
