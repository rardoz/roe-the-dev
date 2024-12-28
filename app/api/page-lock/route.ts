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
export async function POST(req: Request) {
  try {
    const data = await req.json()
    if (data.page_number) {
      await connectDB()
      const code = generateCode()

      const newSketch = await Sketch.create({
        page_number: data.page_number,
        path: ' ',
        is_enabled: false,
      })

      const now = new Date()
      const endTime = new Date(now.getTime() + 24 * 60 * 60 * 1000)

      const lock = new PageLock({
        code,
        startTime: now,
        endTime: endTime,
        sketch_doc: newSketch,
      })

      const savedLock = await lock.save()
      return Response.json({ lock_id: savedLock._id, code })
    } else {
      throw Error('A page number is required')
    }
  } catch (e: any) {
    console.log(e)
    return Response.json({ success: false, message: e.message })
  }
}
