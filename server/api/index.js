// Vercel serverless entry point. Vercel routes /api/* requests to this
// function per vercel.json; it just re-exports the same Express app used
// for local/`node server.js` runs so route behavior never diverges.
//
// NOTE: Vercel's filesystem is read-only/ephemeral outside /tmp, so the
// disk-based PDF upload flow (middleware/upload.js, /uploads static route)
// will NOT persist across invocations here. For production PDF uploads on
// Vercel, swap middleware/upload.js's storage engine for an object store
// (S3, Cloudinary, Vercel Blob) - see README "Deployment" section. Local
// dev and any non-serverless host (Render/Railway/EC2/VPS) work as-is.
const app = require('../server');

module.exports = app;
