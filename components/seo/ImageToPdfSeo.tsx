import Link from 'next/link';

export default function ImageToPdfSeo() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-4xl mx-auto bg-white dark:bg-slate-900 p-8 rounded-3xl border border-gray-200 dark:border-slate-800 transition-colors mt-8 shadow-sm">
      <h2 className="text-2xl sm:text-3xl font-extrabold mb-4 text-slate-900 dark:text-white">
        Professional Image to PDF Studio: Fast, Private, & Versatile
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-300">
        Converting photos, scanned documents, receipts, design mockups, and illustrations into PDF shouldn&apos;t require expensive desktop software, account subscriptions, or sacrificing your confidential data to third-party cloud servers. OmniTools <strong>Image to PDF Studio</strong> delivers an enterprise-grade document generation experience executed 100% locally inside your web browser.
      </p>

      <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-200">
        How to Convert Images into a Combined PDF
      </h3>
      <ol className="list-decimal pl-6 space-y-2 mb-6 text-slate-600 dark:text-slate-300">
        <li>
          <strong>Select or Drop Images:</strong> Drag and drop your JPG, PNG, WebP, BMP, GIF, SVG, or HEIC files into the upload area or click browse. You can add up to 100 images in a single batch.
        </li>
        <li>
          <strong>Arrange Page Sequence:</strong> The order of images in the queue corresponds directly to the page sequence in your final PDF. Use the accessible up and down controls to rearrange pages.
        </li>
        <li>
          <strong>Rotate & Orient:</strong> Rotate individual pages 90° clockwise or counter-clockwise as needed. Auto-orientation can also align landscape and portrait pages dynamically.
        </li>
        <li>
          <strong>Customize Page Layout:</strong> Choose standard document sizes like A4, US Letter, A3, A5, Legal, or select <em>Fit to Image</em> to preserve exact pixel dimensions without empty borders.
        </li>
        <li>
          <strong>Set Compression & Quality:</strong> Choose from high-quality lossless preservation, balanced output, or downscaled compression for lightweight email sharing.
        </li>
        <li>
          <strong>Convert & Download:</strong> Click &ldquo;Convert to PDF&rdquo; to build a validated multi-page PDF document or download separate individual PDFs bundled in a ZIP archive.
        </li>
      </ol>

      <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-200">
        Client-Side Privacy: Your Files Never Leave Your Device
      </h3>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-300">
        Unlike traditional online file converters that transmit your confidential photos, passport scans, tax receipts, or bank statements to remote servers, OmniTools utilizes browser-native Canvas rasterization and client-side <code>pdf-lib</code> libraries. All parsing, rotation, scaling, and PDF serialization happens directly in your browser&apos;s memory. Zero bytes of your image data are ever uploaded across the network.
      </p>

      <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-200">
        Supported Image Formats & Technical Capabilities
      </h3>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-left text-sm border-collapse border border-slate-200 dark:border-slate-800">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200">
              <th className="p-3 border border-slate-200 dark:border-slate-800 font-semibold">Format</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800 font-semibold">Handling Policy</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800 font-semibold">Compression & Alpha</th>
            </tr>
          </thead>
          <tbody className="text-slate-600 dark:text-slate-300">
            <tr>
              <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono font-medium">JPEG / JPG</td>
              <td className="p-3 border border-slate-200 dark:border-slate-800">Direct binary embedding or canvas re-compression</td>
              <td className="p-3 border border-slate-200 dark:border-slate-800">Adjustable quality ratio (60% to 92%)</td>
            </tr>
            <tr>
              <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono font-medium">PNG</td>
              <td className="p-3 border border-slate-200 dark:border-slate-800">Lossless embedding with alpha transparency preservation</td>
              <td className="p-3 border border-slate-200 dark:border-slate-800">Configurable page background color</td>
            </tr>
            <tr>
              <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono font-medium">WebP</td>
              <td className="p-3 border border-slate-200 dark:border-slate-800">Browser-decoded into high-fidelity canvas raster</td>
              <td className="p-3 border border-slate-200 dark:border-slate-800">Optimized JPEG/PNG output stream</td>
            </tr>
            <tr>
              <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono font-medium">BMP</td>
              <td className="p-3 border border-slate-200 dark:border-slate-800">Native Windows bitmap decoding</td>
              <td className="p-3 border border-slate-200 dark:border-slate-800">Compact PDF raster packaging</td>
            </tr>
            <tr>
              <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono font-medium">GIF</td>
              <td className="p-3 border border-slate-200 dark:border-slate-800">Decodes the first frame as a crisp static page</td>
              <td className="p-3 border border-slate-200 dark:border-slate-800">Animation loop is flattened predictably</td>
            </tr>
            <tr>
              <td className="p-3 border border-slate-200 dark:border-slate-800 font-mono font-medium">HEIC / HEIF</td>
              <td className="p-3 border border-slate-200 dark:border-slate-800">Client-side translation via libheif / heic2any</td>
              <td className="p-3 border border-slate-200 dark:border-slate-800">Converted to JPEG stream locally</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-200">
        Frequently Asked Questions (FAQ)
      </h3>
      <div className="space-y-4 mb-8 text-slate-600 dark:text-slate-300">
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-white">
            Will converting multiple images reduce their visual quality?
          </h4>
          <p className="text-sm mt-1">
            By default, OmniTools preserves high resolution using 92% JPEG or original PNG embedding. If you select <em>Original / Lossless</em>, unrotated JPEG and PNG images are embedded directly into the PDF without recompression.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-slate-900 dark:text-white">
            How do margins and page sizes work?
          </h4>
          <p className="text-sm mt-1">
            Standard ISO page sizes (A4, A3, A5) and North American sizes (US Letter, US Legal) use exact typographic point geometry (72 points per inch). In <em>Contain</em> mode, images are centered within your specified margins without any cropping. In <em>Cover</em> mode, images fill the entire printable box.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-slate-900 dark:text-white">
            Can I generate separate PDF documents instead of one combined file?
          </h4>
          <p className="text-sm mt-1">
            Yes! Toggle the output mode from &ldquo;Single Combined PDF&rdquo; to &ldquo;Separate PDFs (ZIP)&rdquo;. OmniTools will create an individual PDF for each image in your queue and package them into a clean, downloadable ZIP archive.
          </p>
        </div>
      </div>

      <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-200">
        Related Document & Media Utilities
      </h3>
      <p className="mb-4 text-slate-600 dark:text-slate-300 text-sm">
        Explore other privacy-focused client-side productivity tools in the OmniTools ecosystem:
      </p>
      <ul className="list-disc pl-6 space-y-1.5 text-sm text-blue-600 dark:text-blue-400">
        <li>
          <Link href="/document/pdf-merge-split" className="hover:underline">
            PDF Merge & Split Tool — Combine multiple PDFs or extract specific page ranges
          </Link>
        </li>
        <li>
          <Link href="/media/image-compressor" className="hover:underline">
            Image Compressor & Optimizer — Reduce image file sizes with adjustable lossy/lossless compression
          </Link>
        </li>
        <li>
          <Link href="/media/webp-to-jpg-png" className="hover:underline">
            WebP to JPG / PNG Converter — Convert next-gen WebP images to legacy formats
          </Link>
        </li>
        <li>
          <Link href="/finance/invoice-generator" className="hover:underline">
            Pro Invoice Generator — Create print-ready, professional PDF invoices with automatic math
          </Link>
        </li>
      </ul>
    </article>
  );
}
