import { connectDB } from '../../../../../lib/mongoose-db'
import PageLock from '../../../../../models/page-lock'
import type { NextApiRequest } from 'next'
/**
 * @swagger
 * /api/page-lock/{lock_id}/{code}:
 *   get:
 *     tags:
 *       - Page Locks
 *     summary: Retrieve a page lock by ID and code
 *     description: Returns the lock information if the code matches
 *     parameters:
 *       - in: path
 *         name: lock_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the lock to check
 *         example: "676f7829f3a2142077877b27"
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^\d{4}$'
 *         description: The 4-digit access code
 *         example: "1797"
 *     responses:
 *       200:
 *         description: Lock retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 lock:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "676f742af3a2142077877b01"
 *                     sketch_doc:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "676f742af3a2142077877afe"
 *                         page_number:
 *                           type: number
 *                           example: 1
 *                         is_enabled:
 *                           type: boolean
 *                           example: false
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-12-28T03:44:42.209Z"
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-12-28T03:44:42.209Z"
 *                         __v:
 *                           type: number
 *                           example: 0
 *                     code:
 *                       type: string
 *                       example: "3248"
 *                     startTime:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-12-28T03:44:42.626Z"
 *                     endTime:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-12-29T03:44:42.626Z"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-12-28T03:44:42.627Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-12-28T03:44:42.627Z"
 *                     __v:
 *                       type: number
 *                       example: 0
 *       400:
 *         description: Bad request - missing lock ID
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
 *                   example: "Lock ID is required!"
 *       401:
 *         description: Invalid code
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
 *                   example: "Invalid code!"
 */
export async function GET(
  req: NextApiRequest,
  { params }: { params: Promise<{ lock_id: string; code: string }> },
) {
  try {
    const { lock_id, code } = await params
    if (!lock_id) throw new Error('Lock ID is required!')
    else {
      await connectDB()
      const lock = await PageLock.findById(lock_id)
      if (lock.code == code) {
        await lock.populate('sketch_doc')
        return Response.json({ lock: lock })
      } else {
        return Response.json({ success: false, message: 'Invalid code!' })
      }
    }
  } catch (e: any) {
    console.log(e)
    return Response.json({ success: false, message: e.message })
  }
}
