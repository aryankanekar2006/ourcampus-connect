<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/8908574c-db94-418c-864b-88dfd8a48cc9

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Flyer Studio

Verified faculty can edit flyers for events they own from **My Submissions**, choose a visual template, customize individual text elements, and submit the finished design for Principal review. Requested changes can be edited and resubmitted. Students see approved flyers, while Principal reviewers use the existing review queue; neither receives faculty editing or regeneration controls.

To use a custom background, provide a direct public HTTP(S) image URL that returns a PNG, JPEG, or WebP image and allows browser cross-origin access. Background images and college logos are stored separately; the final composed flyer is submitted for approval.
