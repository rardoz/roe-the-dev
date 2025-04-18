import { connectDB } from '../../../lib/mongoose-db'
import Sketch from '../../../models/sketch'

/**
 * @swagger
 * /api/sketch:
 *   post:
 *     summary: Save a new sketch
 *     tags:
 *       - Sketch Book
 *     description: Creates a new sketch entry in the database
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sketch_paths:
 *                 type: string
 *                 description: SVG paths for the sketch
 *               page_number:
 *                 type: string
 *                 description: Page number of the sketch
 *     responses:
 *       200:
 *         description: Sketch saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sketch:
 *                   type: object
 *                   properties:
 *                     sketch_paths:
 *                       type: string
 *                     page_number:
 *                       type: string
 *                     is_enabled:
 *                       type: boolean
 *       500:
 *         description: Server error while saving sketch
 */
export async function POST(req: Request) {
  try {
    const data = await req.json()
    await connectDB()
    const sketch = new Sketch({
      sketch_paths: data.sketch_paths,
      page_number: data.page_number,
      is_enabled: false,
    })
    const savedSketch = await sketch.save()
    return Response.json({ sketch: savedSketch })
  } catch (e) {
    console.log(e)
  }
  return Response.json({})
}
