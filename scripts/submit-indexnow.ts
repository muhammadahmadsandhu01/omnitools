/**
 * IndexNow Instant URL Submission Script for KivaroTools (https://kivarotools.com)
 * Fixes Ahrefs Notice: "Changed pages not submitted to IndexNow (74 pages)"
 *
 * Usage:
 *   1. Place `4f8b9c2d1e6a7f3b5a9d0c8e2f4a6b1c.txt` inside your `public/` directory (`d:/omnitools/public/4f8b9c2d1e6a7f3b5a9d0c8e2f4a6b1c.txt`)
 *      and also paste `4f8b9c2d1e6a7f3b5a9d0c8e2f4a6b1c` in Ahrefs -> Project Settings -> Crawl Settings -> IndexNow Key.
 *   2. After deploying to production (`npm run deploy:vinext`), run:
 *      node scripts/submit-indexnow.mjs
 */

const SITE_URL = 'https://kivarotools.com';
const HOST = 'kivarotools.com';
const KEY = '4f8b9c2d1e6a7f3b5a9d0c8e2f4a6b1c';
const KEY_LOCATION = `${SITE_URL}/${KEY}.txt`;

const URL_LIST = [
    `${SITE_URL}/`,
    `${SITE_URL}/finance`,
    `${SITE_URL}/developer`,
    `${SITE_URL}/document`,
    `${SITE_URL}/media`,
    `${SITE_URL}/seo`,
    `${SITE_URL}/about`,
    `${SITE_URL}/contact`,
    `${SITE_URL}/privacy`,
    `${SITE_URL}/terms`,
    // 42 Canonical Tools
    `${SITE_URL}/finance/salary-calculator`,
    `${SITE_URL}/finance/saas-burn-rate-calculator`,
    `${SITE_URL}/finance/contractor-vs-employee-calculator`,
    `${SITE_URL}/finance/mortgage-calculator`,
    `${SITE_URL}/finance/emi-calculator`,
    `${SITE_URL}/finance/compound-interest`,
    `${SITE_URL}/finance/sip-calculator`,
    `${SITE_URL}/finance/crypto-converter`,
    `${SITE_URL}/finance/precious-metals`,
    `${SITE_URL}/finance/invoice-generator`,
    `${SITE_URL}/developer/json-formatter`,
    `${SITE_URL}/developer/sqlite-viewer`,
    `${SITE_URL}/developer/openapi-to-typescript`,
    `${SITE_URL}/developer/jwt-debugger`,
    `${SITE_URL}/developer/cron-expression-generator`,
    `${SITE_URL}/developer/json-converter`,
    `${SITE_URL}/developer/sql-formatter`,
    `${SITE_URL}/developer/regex-tester`,
    `${SITE_URL}/developer/base64-encoder`,
    `${SITE_URL}/developer/svg-optimizer`,
    `${SITE_URL}/developer/har-analyzer`,
    `${SITE_URL}/developer/parquet-viewer`,
    `${SITE_URL}/developer/password-generator`,
    `${SITE_URL}/document/pdf-merge-split`,
    `${SITE_URL}/document/pdf-signer-bates-stamper`,
    `${SITE_URL}/document/pdf-scrubber`,
    `${SITE_URL}/document/compress-pdf`,
    `${SITE_URL}/document/pdf-to-word`,
    `${SITE_URL}/document/word-to-pdf`,
    `${SITE_URL}/document/pdf-to-excel`,
    `${SITE_URL}/document/excel-to-pdf`,
    `${SITE_URL}/document/pdf-to-ppt`,
    `${SITE_URL}/document/pdf-to-jpg`,
    `${SITE_URL}/document/image-to-pdf`,
    `${SITE_URL}/media/heic-to-jpg`,
    `${SITE_URL}/media/image-compressor`,
    `${SITE_URL}/media/webp-to-jpg-png`,
    `${SITE_URL}/seo/text-analyzer`,
    `${SITE_URL}/seo/llms-txt-generator`,
    `${SITE_URL}/seo/text-case-converter`,
    `${SITE_URL}/seo/meta-generator`,
    `${SITE_URL}/seo/qr-generator`,
    // 22 Country Salary Calculators
    `${SITE_URL}/finance/salary-calculator/pakistan`,
    `${SITE_URL}/finance/salary-calculator/united-states`,
    `${SITE_URL}/finance/salary-calculator/united-kingdom`,
    `${SITE_URL}/finance/salary-calculator/germany`,
    `${SITE_URL}/finance/salary-calculator/india`,
    `${SITE_URL}/finance/salary-calculator/canada`,
    `${SITE_URL}/finance/salary-calculator/australia`,
    `${SITE_URL}/finance/salary-calculator/singapore`,
    `${SITE_URL}/finance/salary-calculator/united-arab-emirates`,
    `${SITE_URL}/finance/salary-calculator/saudi-arabia`,
    `${SITE_URL}/finance/salary-calculator/france`,
    `${SITE_URL}/finance/salary-calculator/japan`,
    `${SITE_URL}/finance/salary-calculator/switzerland`,
    `${SITE_URL}/finance/salary-calculator/netherlands`,
    `${SITE_URL}/finance/salary-calculator/ireland`,
    `${SITE_URL}/finance/salary-calculator/new-zealand`,
    `${SITE_URL}/finance/salary-calculator/spain`,
    `${SITE_URL}/finance/salary-calculator/italy`,
    `${SITE_URL}/finance/salary-calculator/south-africa`,
    `${SITE_URL}/finance/salary-calculator/brazil`,
    `${SITE_URL}/finance/salary-calculator/mexico`,
    `${SITE_URL}/finance/salary-calculator/south-korea`,
];

async function submitToIndexNow() {
    console.log(`Submitting ${URL_LIST.length} canonical URLs to IndexNow...`);
    const response = await fetch('https://api.indexnow.org/indexnow', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({
            host: HOST,
            key: KEY,
            keyLocation: KEY_LOCATION,
            urlList: URL_LIST,
        }),
    });

    console.log(`IndexNow HTTP Status: ${response.status} ${response.statusText}`);
    if (response.status === 200 || response.status === 202) {
        console.log('SUCCESS: All 74+ canonical pages submitted to IndexNow (Bing, Yandex, Naver, Seznam, Ahrefs).');
    } else {
        const text = await response.text();
        console.error('IndexNow response body:', text);
    }
}

submitToIndexNow().catch(console.error);