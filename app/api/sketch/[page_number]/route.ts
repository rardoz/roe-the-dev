import { NextRequest } from 'next/server'
import { connectDB } from '../../../../lib/mongoose-db'
import Sketch from '../../../../models/sketch'
/**
 * @swagger
 * /api/sketch/{page_number}:
 *   get:
 *     summary: Retrieve sketches by page number
 *     tags:
 *       - Sketch Book
 *     description: Gets all sketches for a specific page number
 *     parameters:
 *       - in: path
 *         name: page_number
 *         required: true
 *         schema:
 *           type: string
 *         description: The page number to fetch sketches for
 *     responses:
 *       200:
 *         description: List of sketches
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   sketch_paths:
 *                     type: string
 *                   page_number:
 *                     type: string
 *                   is_enabled:
 *                     type: boolean
 *       500:
 *         description: Server error while fetching sketches
 */
export async function GET(
  req: Request | NextRequest,
  { params }: { params: Promise<{ page_number: string }> },
) {
  try {
    const { page_number } = await params
    if (!page_number) throw new Error('Page number is required')
    else {
      await connectDB()
      const pages = await Sketch.find({ page_number })
      return Response.json(pages)
    }
    // const page_number = req.query.page_number
    // await connectDB()
    // const pages = await Sketch.find({ page_number })
    // return Response.json(pages)
  } catch (e: any) {
    console.log(e)
    return Response.json({ success: false, message: e.message })
  }
}

/**
 * @swagger
 * /api/sketch:
 *   post:
 *     summary: Save a new sketch
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
export async function POST(req: Request | NextRequest) {
  try {
    await connectDB()
    const body = await req.json()
    const sketch = new Sketch({
      sketch_paths: body.sketch_paths,
      page_number: body.page_number,
      is_enabled: false,
    })
    const savedSketch = await sketch.save()
    return Response.json({ sketch: savedSketch })
  } catch (e) {
    console.log(e)
  }
  return Response.json({})
}
