export async function GET() {
  // Return 204 No Content to suppress the 404 error
  return new Response(null, { status: 204 });
  
  // Alternatively, to support the feature, uncomment below:
  // return Response.json({
  //   workspace: {
  //     root: process.cwd(),
  //     uuid: "YOUR-UNIQUE-UUID-HERE" // Generate with: npx uuid v4
  //   }
  // });
} 