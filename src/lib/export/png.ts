/**
 * PNG Exporter for Custom Report Builder
 *
 * Exports chart/report preview elements as PNG images
 * using html2canvas pattern.
 *
 * Note: For full PNG export support, install html2canvas:
 *   npm install html2canvas
 *   npm install -D @types/html2canvas
 */

import type { ExportOptions } from "@/types/report-builder";
import { downloadBlob, generateFilename, MIME_TYPES } from "./utils";

// =============================================================================
// TYPES
// =============================================================================

/**
 * Options specific to PNG export.
 */
export interface PNGExportOptions extends ExportOptions {
  /** Scale factor for higher resolution (default: 2 for retina) */
  scale?: number;
  /** Background color (default: white) */
  backgroundColor?: string;
  /** Image quality for JPEG (0-1, only used if format is jpeg) */
  quality?: number;
  /** Padding around the captured element in pixels */
  padding?: number;
  /** Width to scale the image to (maintains aspect ratio) */
  width?: number;
  /** Height to scale the image to (maintains aspect ratio) */
  height?: number;
}

/**
 * Capture result containing the blob and dimensions.
 */
export interface CaptureResult {
  blob: Blob;
  width: number;
  height: number;
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Get element by ID with error handling.
 */
function getElement(elementId: string): HTMLElement | null {
  const element = document.getElementById(elementId);

  if (!element) {
    console.error(`Element with ID "${elementId}" not found`);
    return null;
  }

  return element;
}

/**
 * Apply padding wrapper to element for capture.
 */
function applyPaddingWrapper(
  element: HTMLElement,
  padding: number,
  backgroundColor: string
): HTMLElement {
  const wrapper = document.createElement("div");
  wrapper.style.padding = `${padding}px`;
  wrapper.style.backgroundColor = backgroundColor;
  wrapper.style.display = "inline-block";

  // Clone the element to avoid modifying the original
  const clone = element.cloneNode(true) as HTMLElement;
  wrapper.appendChild(clone);

  // Temporarily add to DOM for capture
  wrapper.style.position = "absolute";
  wrapper.style.left = "-9999px";
  document.body.appendChild(wrapper);

  return wrapper;
}

/**
 * Clean up temporary elements.
 */
function cleanupWrapper(wrapper: HTMLElement): void {
  if (wrapper.parentNode) {
    wrapper.parentNode.removeChild(wrapper);
  }
}

// =============================================================================
// CANVAS-BASED CAPTURE (Fallback)
// =============================================================================

/**
 * Simple canvas-based capture for basic elements.
 * This is a fallback when html2canvas is not available.
 */
async function captureWithCanvas(
  element: HTMLElement,
  options: PNGExportOptions
): Promise<Blob> {
  const { scale = 2, backgroundColor = "#ffffff" } = options;

  const rect = element.getBoundingClientRect();
  const width = rect.width * scale;
  const height = rect.height * scale;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not get canvas context");
  }

  // Fill background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);

  // Note: This basic fallback cannot capture complex DOM elements
  // For full functionality, html2canvas is required
  ctx.scale(scale, scale);

  // Draw a placeholder indicating html2canvas is needed
  ctx.fillStyle = "#666666";
  ctx.font = "14px Arial";
  ctx.textAlign = "center";
  ctx.fillText(
    "For full PNG export, install html2canvas",
    rect.width / 2,
    rect.height / 2 - 10
  );
  ctx.fillText(
    "npm install html2canvas",
    rect.width / 2,
    rect.height / 2 + 10
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to create blob from canvas"));
        }
      },
      "image/png",
      1
    );
  });
}

// =============================================================================
// HTML2CANVAS CAPTURE
// =============================================================================

/**
 * Capture element using html2canvas library.
 */
async function captureWithHtml2Canvas(
  element: HTMLElement,
  options: PNGExportOptions
): Promise<Blob> {
  const { scale = 2, backgroundColor = "#ffffff" } = options;

  try {
    // Dynamic import of html2canvas
    // Note: html2canvas is an optional dependency. Install with: npm install html2canvas
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const html2canvasModule = await import("html2canvas" as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const html2canvas = (html2canvasModule as any).default as (
      element: HTMLElement,
      options?: Record<string, unknown>
    ) => Promise<HTMLCanvasElement>;

    const canvas = await html2canvas(element, {
      scale,
      backgroundColor,
      useCORS: true,
      allowTaint: true,
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob: Blob | null) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to create blob from canvas"));
          }
        },
        "image/png",
        1
      );
    });
  } catch (error) {
    // html2canvas not available, use fallback
    console.warn(
      "html2canvas not available, using basic fallback. Install html2canvas for full PNG export support."
    );
    return captureWithCanvas(element, options);
  }
}

// =============================================================================
// MAIN EXPORT FUNCTIONS
// =============================================================================

/**
 * Export an element as PNG image.
 *
 * @param elementId - ID of the DOM element to capture
 * @param options - Export options (optional)
 * @returns Promise resolving to PNG Blob
 */
export async function exportToPNG(
  elementId: string,
  options: PNGExportOptions = { format: "png", includeCharts: true }
): Promise<Blob> {
  const element = getElement(elementId);

  if (!element) {
    throw new Error(`Element with ID "${elementId}" not found`);
  }

  const { padding = 0, backgroundColor = "#ffffff" } = options;

  let targetElement = element;
  let wrapper: HTMLElement | null = null;

  // Apply padding if needed
  if (padding > 0) {
    wrapper = applyPaddingWrapper(element, padding, backgroundColor);
    targetElement = wrapper;
  }

  try {
    const blob = await captureWithHtml2Canvas(targetElement, options);
    return blob;
  } finally {
    // Clean up wrapper if created
    if (wrapper) {
      cleanupWrapper(wrapper);
    }
  }
}

/**
 * Export an element as PNG with dimensions.
 *
 * @param elementId - ID of the DOM element to capture
 * @param options - Export options (optional)
 * @returns Promise resolving to CaptureResult with blob and dimensions
 */
export async function exportToPNGWithDimensions(
  elementId: string,
  options?: PNGExportOptions
): Promise<CaptureResult> {
  const element = getElement(elementId);

  if (!element) {
    throw new Error(`Element with ID "${elementId}" not found`);
  }

  const rect = element.getBoundingClientRect();
  const scale = options?.scale ?? 2;

  const blob = await exportToPNG(elementId, options);

  return {
    blob,
    width: rect.width * scale,
    height: rect.height * scale,
  };
}

/**
 * Download an element as a PNG file.
 *
 * @param elementId - ID of the DOM element to capture
 * @param filename - Optional custom filename
 * @param options - Export options (optional)
 */
export async function downloadPNG(
  elementId: string,
  filename?: string,
  options?: PNGExportOptions
): Promise<void> {
  const blob = await exportToPNG(elementId, options);
  const finalFilename =
    filename ?? options?.filename ?? `chart-export-${Date.now()}.png`;

  downloadBlob(blob, finalFilename);
}

/**
 * Export multiple elements as a combined PNG.
 *
 * @param elementIds - Array of element IDs to capture
 * @param options - Export options (optional)
 * @returns Promise resolving to PNG Blob
 */
export async function exportMultipleToPNG(
  elementIds: string[],
  options: PNGExportOptions = { format: "png", includeCharts: true }
): Promise<Blob> {
  const { scale = 2, backgroundColor = "#ffffff" } = options;

  // Capture all elements
  const captures: Array<{ blob: Blob; element: HTMLElement }> = [];

  for (const id of elementIds) {
    const element = getElement(id);
    if (element) {
      const blob = await exportToPNG(id, options);
      captures.push({ blob, element });
    }
  }

  if (captures.length === 0) {
    throw new Error("No elements found to capture");
  }

  // If only one element, return it directly
  const firstCapture = captures[0];
  if (captures.length === 1 && firstCapture) {
    return firstCapture.blob;
  }

  // Combine images vertically
  // Load all images
  const images = await Promise.all(
    captures.map(
      ({ blob }) =>
        new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = URL.createObjectURL(blob);
        })
    )
  );

  // Calculate combined dimensions
  const totalWidth = Math.max(...images.map((img) => img.width));
  const totalHeight = images.reduce((sum, img) => sum + img.height, 0);
  const gap = 20 * scale;
  const finalHeight = totalHeight + gap * (images.length - 1);

  // Create combined canvas
  const canvas = document.createElement("canvas");
  canvas.width = totalWidth;
  canvas.height = finalHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not get canvas context");
  }

  // Fill background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, totalWidth, finalHeight);

  // Draw images
  let yOffset = 0;
  for (const img of images) {
    ctx.drawImage(img, 0, yOffset);
    yOffset += img.height + gap;
    URL.revokeObjectURL(img.src);
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to create combined blob"));
        }
      },
      "image/png",
      1
    );
  });
}

/**
 * Create a data URL from element capture.
 *
 * @param elementId - ID of the DOM element to capture
 * @param options - Export options (optional)
 * @returns Promise resolving to base64 data URL
 */
export async function exportToDataURL(
  elementId: string,
  options?: PNGExportOptions
): Promise<string> {
  const blob = await exportToPNG(elementId, options);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to convert blob to data URL"));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
