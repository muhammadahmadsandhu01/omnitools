import type { ComponentType } from 'react';

// ============================================================
// Tool Functional Components
// ============================================================
import SaasBurnRateCalculator from '@/components/tools/SaasBurnRateCalculator';
import PreciousMetals from '@/components/tools/PreciousMetals';
import EmiCalculator from '@/components/tools/EmiCalculator';
import ContractorVsEmployeeCalculator from '@/components/tools/ContractorVsEmployeeCalculator';
import MortgageCalculator from '@/components/tools/MortgageCalculator';
import CompoundInterest from '@/components/tools/CompoundInterest';
import SipCalculator from '@/components/tools/SipCalculator';
import SalaryCalculator from '@/components/tools/SalaryCalculator';
import CryptoConverter from '@/components/tools/CryptoConverter';
import InvoiceGenerator from '@/components/tools/InvoiceGenerator';
import JsonFormatter from '@/components/tools/JsonFormatter';
import OpenapiToTypescript from '@/components/tools/OpenapiToTypescript';
import SvgOptimizer from '@/components/tools/SvgOptimizer';
import PasswordGenerator from '@/components/tools/PasswordGenerator';
import JsonConverter from '@/components/tools/JsonConverter';
import SqliteExplorer from '@/components/tools/SqliteExplorer';
import Base64Encoder from '@/components/tools/Base64Encoder';
import SqlFormatter from '@/components/tools/SqlFormatter';
import RegexTester from '@/components/tools/RegexTester';
import ParquetViewer from '@/components/tools/ParquetViewer';
import PdfMergeSplit from '@/components/tools/PdfMergeSplit';
import PdfScrubber from '@/components/tools/PdfScrubber';
import HarAnalyzer from '@/components/tools/HarAnalyzer';
import ImageToPdf from '@/components/tools/ImageToPdf';
import PdfToWord from '@/components/tools/PdfToWord';
import WordToPdf from '@/components/tools/WordToPdf';
import PdfToExcel from '@/components/tools/PdfToExcel';
import ExcelToPdf from '@/components/tools/ExcelToPdf';
import PdfToPpt from '@/components/tools/PdfToPpt';
import PdfToJpg from '@/components/tools/PdfToJpg';
import PdfCompressor from '@/components/tools/PdfCompressor';
import WebpToJpgPng from '@/components/tools/WebpToJpgPng';
import ImageCompressor from '@/components/tools/ImageCompressor';
import QrGenerator from '@/components/tools/QrGenerator';
import LlmsTxtGenerator from '@/components/tools/LlmsTxtGenerator';
import TextAnalyzer from '@/components/tools/TextAnalyzer';
import TextCaseConverter from '@/components/tools/TextCaseConverter';
import MetaGenerator from '@/components/tools/MetaGenerator';

// ============================================================
// SEO Landing Page Content Components
// ============================================================
import SaasBurnRateCalculatorSeo from '@/components/seo/SaasBurnRateCalculatorSeo';
import PreciousMetalsSeo from '@/components/seo/PreciousMetalsSeo';
import EmiCalculatorSeo from '@/components/seo/EmiCalculatorSeo';
import ContractorVsEmployeeSeo from '@/components/seo/ContractorVsEmployeeSeo';
import MortgageCalculatorSeo from '@/components/seo/MortgageCalculatorSeo';
import CompoundInterestSeo from '@/components/seo/CompoundInterestSeo';
import SipCalculatorSeo from '@/components/seo/SipCalculatorSeo';
import SalaryCalculatorSeo from '@/components/seo/SalaryCalculatorSeo';
import CryptoConverterSeo from '@/components/seo/CryptoConverterSeo';
import InvoiceGeneratorSeo from '@/components/seo/InvoiceGeneratorSeo';
import JsonFormatterSeo from '@/components/seo/JsonFormatterSeo';
import OpenapiToTypescriptSeo from '@/components/seo/OpenapiToTypescriptSeo';
import SvgOptimizerSeo from '@/components/seo/SvgOptimizerSeo';
import PasswordGeneratorSeo from '@/components/seo/PasswordGeneratorSeo';
import JsonConverterSeo from '@/components/seo/JsonConverterSeo';
import SqliteExplorerSeo from '@/components/seo/SqliteExplorerSeo';
import Base64EncoderSeo from '@/components/seo/Base64EncoderSeo';
import SqlFormatterSeo from '@/components/seo/SqlFormatterSeo';
import RegexTesterSeo from '@/components/seo/RegexTesterSeo';
import ParquetViewerSeo from '@/components/seo/ParquetViewerSeo';
import PdfMergeSplitSeo from '@/components/seo/PdfMergeSplitSeo';
import PdfScrubberSeo from '@/components/seo/PdfScrubberSeo';
import HarAnalyzerSeo from '@/components/seo/HarAnalyzerSeo';
import ImageToPdfSeo from '@/components/seo/ImageToPdfSeo';
import PdfToWordSeo from '@/components/seo/PdfToWordSeo';
import WordToPdfSeo from '@/components/seo/WordToPdfSeo';
import PdfToExcelSeo from '@/components/seo/PdfToExcelSeo';
import ExcelToPdfSeo from '@/components/seo/ExcelToPdfSeo';
import PdfToPptSeo from '@/components/seo/PdfToPptSeo';
import PdfToJpgSeo from '@/components/seo/PdfToJpgSeo';
import PdfCompressorSeo from '@/components/seo/PdfCompressorSeo';
import WebpToJpgPngSeo from '@/components/seo/WebpToJpgPngSeo';
import ImageCompressorSeo from '@/components/seo/ImageCompressorSeo';
import QrGeneratorSeo from '@/components/seo/QrGeneratorSeo';
import LlmsTxtGeneratorSeo from '@/components/seo/LlmsTxtGeneratorSeo';
import TextAnalyzerSeo from '@/components/seo/TextAnalyzerSeo';
import TextCaseConverterSeo from '@/components/seo/TextCaseConverterSeo';
import MetaGeneratorSeo from '@/components/seo/MetaGeneratorSeo';

/**
 * Functional tool component registry.
 * Maps tool slugs and legacy aliases to their interactive UI component.
 */
export const toolComponents: Record<string, ComponentType<Record<string, never>>> = {
  // Finance
  'precious-metals': PreciousMetals,
  'emi-calculator': EmiCalculator,
  'mortgage-calculator': MortgageCalculator,
  'compound-interest': CompoundInterest,
  'sip-calculator': SipCalculator,
  'salary-calculator': SalaryCalculator,
  'crypto-converter': CryptoConverter,
  'currency-converter': CryptoConverter, // Alias
  'invoice-generator': InvoiceGenerator,
  'saas-burn-rate-calculator': SaasBurnRateCalculator,
  'startup-runway-calculator': SaasBurnRateCalculator, // Alias
  'safe-dilution-calculator': SaasBurnRateCalculator, // Alias
  'cap-table-simulator': SaasBurnRateCalculator, // Alias
  'default-alive-calculator': SaasBurnRateCalculator, // Alias
  'burn-multiple-calculator': SaasBurnRateCalculator, // Alias
  'liquidation-preference-calculator': SaasBurnRateCalculator, // Alias
  'contractor-vs-employee-calculator': ContractorVsEmployeeCalculator,
  '1099-vs-w2-calculator': ContractorVsEmployeeCalculator, // Alias
  'w2-to-1099-calculator': ContractorVsEmployeeCalculator, // Alias
  'ir35-calculator': ContractorVsEmployeeCalculator, // Alias
  's-corp-tax-calculator': ContractorVsEmployeeCalculator, // Alias
  't4-vs-incorporated-calculator': ContractorVsEmployeeCalculator, // Alias
  'eor-cost-calculator': ContractorVsEmployeeCalculator, // Alias

  // Developer
  'json-formatter': JsonFormatter,
  'svg-optimizer': SvgOptimizer,
  'password-generator': PasswordGenerator,
  'json-converter': JsonConverter,
  'base64-encoder': Base64Encoder,
  'sql-formatter': SqlFormatter,
  'regex-tester': RegexTester,
  'parquet-viewer': ParquetViewer,
  'parquet-to-csv': ParquetViewer,
  'avro-viewer': ParquetViewer,
  'avro-to-json': ParquetViewer,
  'avro-to-csv': ParquetViewer,
  'feather-viewer': ParquetViewer,
  'arrow-viewer': ParquetViewer,
  'feather-to-csv': ParquetViewer,
  'har-analyzer': HarAnalyzer,
  'har-viewer': HarAnalyzer, // Alias
  'har-sanitizer': HarAnalyzer, // Alias
  'har-to-k6': HarAnalyzer, // Alias
  'har-to-playwright': HarAnalyzer, // Alias
  'har-to-openapi': HarAnalyzer, // Alias
  'saml-har-analyzer': HarAnalyzer, // Alias 
  'sqlite-viewer': SqliteExplorer,
  'sqlite-browser': SqliteExplorer, // Alias
  'duckdb-viewer': SqliteExplorer, // Alias
  'sqlite-online': SqliteExplorer, // Alias
  'db-file-viewer': SqliteExplorer, // Alias
  'sqlite-erd-generator': SqliteExplorer, // Alias
  'sqlite-to-postgres': SqliteExplorer, // Alias
  'openapi-to-typescript': OpenapiToTypescript,
  'openapi-to-zod': OpenapiToTypescript, // Alias
  'swagger-to-typescript': OpenapiToTypescript, // Alias
  'swagger-to-zod': OpenapiToTypescript, // Alias
  'openapi-mock-generator': OpenapiToTypescript, // Alias
  'openapi-msw-generator': OpenapiToTypescript, // Alias
  'openapi-tanstack-query-generator': OpenapiToTypescript, // Alias

  // Document
  'pdf-merge-split': PdfMergeSplit,
  'image-to-pdf': ImageToPdf,
  'pdf-to-word': PdfToWord,
  'pdf-to-docx': PdfToWord, // Alias
  'word-to-pdf': WordToPdf,
  'docx-to-pdf': WordToPdf, // Alias
  'pdf-to-excel': PdfToExcel,
  'pdf-to-xlsx': PdfToExcel, // Alias
  'excel-to-pdf': ExcelToPdf,
  'xlsx-to-pdf': ExcelToPdf, // Alias
  'pdf-to-ppt': PdfToPpt,
  'pdf-to-pptx': PdfToPpt, // Alias
  'pdf-to-powerpoint': PdfToPpt, // Alias
  'pdf-to-jpg': PdfToJpg,
  'pdf-to-png': PdfToJpg, // Alias
  'pdf-to-image': PdfToJpg, // Alias
  'compress-pdf': PdfCompressor,
  'pdf-compressor': PdfCompressor, // Alias
  'reduce-pdf-size': PdfCompressor, // Alias
  'shrink-pdf': PdfCompressor, // Alias
  'compress-pdf-to-100kb': PdfCompressor, // Alias
  'compress-pdf-to-200kb': PdfCompressor, // Alias
  'pdf-scrubber': PdfScrubber,
  'pdf-redactor': PdfScrubber, // Alias -> /document/pdf-redactor
  'pdf-pii-scrubber': PdfScrubber, // Alias -> /document/pdf-pii-scrubber
  'bank-statement-redactor': PdfScrubber, // Alias -> /document/bank-statement-redactor
  'invoice-redactor': PdfScrubber, // Alias -> /document/invoice-redactor
  'redact-pdf': PdfScrubber, // Alias -> /document/redact-pdf

  // Media
  'webp-to-jpg-png': WebpToJpgPng,
  'webp-converter': WebpToJpgPng, // Alias
  'image-compressor': ImageCompressor,

  // SEO & Text
  'qr-generator': QrGenerator,
  'text-analyzer': TextAnalyzer,
  'text-case-converter': TextCaseConverter,
  'case-converter': TextCaseConverter, // Alias
  'meta-generator': MetaGenerator,
  'meta-tags-generator': MetaGenerator, // Alias
  'open-graph-generator': MetaGenerator, // Alias
  'llms-txt-generator': LlmsTxtGenerator,
  'llms-txt-validator': LlmsTxtGenerator,
  'llms-full-txt-generator': LlmsTxtGenerator,
  'ai-robots-txt-generator': LlmsTxtGenerator,
  'ai-crawler-generator': LlmsTxtGenerator,
  'tdmrep-generator': LlmsTxtGenerator,
};

/**
 * SEO landing page content registry.
 * Maps tool slugs and legacy aliases to their rich informational landing component.
 */
export const seoComponents: Record<string, ComponentType<Record<string, never>>> = {
  // Finance
  'precious-metals': PreciousMetalsSeo,
  'emi-calculator': EmiCalculatorSeo,
  'mortgage-calculator': MortgageCalculatorSeo,
  'compound-interest': CompoundInterestSeo,
  'sip-calculator': SipCalculatorSeo,
  'salary-calculator': SalaryCalculatorSeo,
  'crypto-converter': CryptoConverterSeo,
  'currency-converter': CryptoConverterSeo, // Alias
  'invoice-generator': InvoiceGeneratorSeo,
  'saas-burn-rate-calculator': SaasBurnRateCalculatorSeo,
  'startup-runway-calculator': SaasBurnRateCalculatorSeo, // Alias
  'safe-dilution-calculator': SaasBurnRateCalculatorSeo, // Alias
  'cap-table-simulator': SaasBurnRateCalculatorSeo, // Alias
  'default-alive-calculator': SaasBurnRateCalculatorSeo, // Alias
  'burn-multiple-calculator': SaasBurnRateCalculatorSeo, // Alias
  'liquidation-preference-calculator': SaasBurnRateCalculatorSeo, // Alias
  'contractor-vs-employee-calculator': ContractorVsEmployeeSeo,
  '1099-vs-w2-calculator': ContractorVsEmployeeSeo, // Alias
  'w2-to-1099-calculator': ContractorVsEmployeeSeo, // Alias
  'ir35-calculator': ContractorVsEmployeeSeo, // Alias
  's-corp-tax-calculator': ContractorVsEmployeeSeo, // Alias
  't4-vs-incorporated-calculator': ContractorVsEmployeeSeo, // Alias
  'eor-cost-calculator': ContractorVsEmployeeSeo, // Alias

  // Developer
  'json-formatter': JsonFormatterSeo,
  'svg-optimizer': SvgOptimizerSeo,
  'password-generator': PasswordGeneratorSeo,
  'json-converter': JsonConverterSeo,
  'base64-encoder': Base64EncoderSeo,
  'sql-formatter': SqlFormatterSeo,
  'regex-tester': RegexTesterSeo,
  'parquet-viewer': ParquetViewerSeo,
  'parquet-to-csv': ParquetViewerSeo,
  'avro-viewer': ParquetViewerSeo,
  'avro-to-json': ParquetViewerSeo,
  'avro-to-csv': ParquetViewerSeo,
  'feather-viewer': ParquetViewerSeo,
  'arrow-viewer': ParquetViewerSeo,
  'feather-to-csv': ParquetViewerSeo,
  'har-analyzer': HarAnalyzerSeo,
  'har-viewer': HarAnalyzerSeo, // Alias
  'har-sanitizer': HarAnalyzerSeo, // Alias
  'har-to-k6': HarAnalyzerSeo, // Alias
  'har-to-playwright': HarAnalyzerSeo, // Alias
  'har-to-openapi': HarAnalyzerSeo, // Alias
  'saml-har-analyzer': HarAnalyzerSeo, // Alias
  'sqlite-viewer': SqliteExplorerSeo,
  'sqlite-browser': SqliteExplorerSeo, // Alias
  'duckdb-viewer': SqliteExplorerSeo, // Alias
  'sqlite-online': SqliteExplorerSeo, // Alias
  'db-file-viewer': SqliteExplorerSeo, // Alias
  'sqlite-erd-generator': SqliteExplorerSeo, // Alias
  'sqlite-to-postgres': SqliteExplorerSeo, // Alias
  'openapi-to-typescript': OpenapiToTypescriptSeo,
  'openapi-to-zod': OpenapiToTypescriptSeo, // Alias
  'swagger-to-typescript': OpenapiToTypescriptSeo, // Alias
  'swagger-to-zod': OpenapiToTypescriptSeo, // Alias
  'openapi-mock-generator': OpenapiToTypescriptSeo, // Alias
  'openapi-msw-generator': OpenapiToTypescriptSeo, // Alias
  'openapi-tanstack-query-generator': OpenapiToTypescriptSeo, // Alias

  // Document
  'pdf-merge-split': PdfMergeSplitSeo,
  'image-to-pdf': ImageToPdfSeo,
  'pdf-to-word': PdfToWordSeo,
  'pdf-to-docx': PdfToWordSeo, // Alias
  'word-to-pdf': WordToPdfSeo,
  'docx-to-pdf': WordToPdfSeo, // Alias
  'pdf-to-excel': PdfToExcelSeo,
  'pdf-to-xlsx': PdfToExcelSeo, // Alias
  'excel-to-pdf': ExcelToPdfSeo,
  'xlsx-to-pdf': ExcelToPdfSeo, // Alias
  'pdf-to-ppt': PdfToPptSeo,
  'pdf-to-pptx': PdfToPptSeo, // Alias
  'pdf-to-powerpoint': PdfToPptSeo, // Alias
  'pdf-to-jpg': PdfToJpgSeo,
  'pdf-to-png': PdfToJpgSeo, // Alias
  'pdf-to-image': PdfToJpgSeo, // Alias
  'compress-pdf': PdfCompressorSeo,
  'pdf-compressor': PdfCompressorSeo, // Alias
  'reduce-pdf-size': PdfCompressorSeo, // Alias
  'shrink-pdf': PdfCompressorSeo, // Alias
  'compress-pdf-to-100kb': PdfCompressorSeo, // Alias
  'compress-pdf-to-200kb': PdfCompressorSeo, // Alias
  'pdf-scrubber': PdfScrubberSeo,
  'pdf-redactor': PdfScrubberSeo, // Alias
  'pdf-pii-scrubber': PdfScrubberSeo, // Alias
  'bank-statement-redactor': PdfScrubberSeo, // Alias
  'invoice-redactor': PdfScrubberSeo, // Alias
  'redact-pdf': PdfScrubberSeo, // Alias


  // Media
  'webp-to-jpg-png': WebpToJpgPngSeo,
  'webp-converter': WebpToJpgPngSeo, // Alias
  'image-compressor': ImageCompressorSeo,

  // SEO & Text
  'qr-generator': QrGeneratorSeo,
  'text-analyzer': TextAnalyzerSeo,
  'text-case-converter': TextCaseConverterSeo,
  'case-converter': TextCaseConverterSeo, // Alias
  'meta-generator': MetaGeneratorSeo,
  'meta-tags-generator': MetaGeneratorSeo, // Alias
  'open-graph-generator': MetaGeneratorSeo, // Alias
  'llms-txt-generator': LlmsTxtGeneratorSeo,
  'llms-txt-validator': LlmsTxtGeneratorSeo,
  'llms-full-txt-generator': LlmsTxtGeneratorSeo,
  'ai-robots-txt-generator': LlmsTxtGeneratorSeo,
  'ai-crawler-generator': LlmsTxtGeneratorSeo,
  'tdmrep-generator': LlmsTxtGeneratorSeo,
};

/**
 * Retrieve the functional component for a given tool slug.
 */
export function getToolComponent(slug: string): ComponentType<Record<string, never>> | undefined {
  return toolComponents[slug];
}

/**
 * Retrieve the SEO landing content component for a given tool slug.
 */
export function getSeoComponent(slug: string): ComponentType<Record<string, never>> | undefined {
  return seoComponents[slug];
}
