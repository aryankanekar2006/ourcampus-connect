import React, { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { X, Sparkles, Download, RefreshCw, Share2, CheckCircle2, Upload } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getEventDateLabel } from "../features/eventRules";
import { canEditEventArtwork, isValidFlyerDesign } from "../features/artworkRules";
import websiteLogo from "./CollegeLogo.png";

const flyerTemplates = {
  academic: {
    label: "Academic Seminar",
    font: "Georgia",
    background: "linear-gradient(145deg, #082f49, #1e3a8a 52%, #172554)",
    overlay: "linear-gradient(180deg, rgba(8,47,73,.18), rgba(15,23,42,.91))",
    titlePosition: "bottom"
  },
  workshop: {
    label: "Technical Workshop",
    font: "Trebuchet MS",
    background: "linear-gradient(135deg, #111827, #1d4ed8 55%, #0f172a)",
    overlay: "linear-gradient(135deg, rgba(15,23,42,.58), rgba(30,64,175,.76) 54%, rgba(2,6,23,.94))",
    titlePosition: "middle"
  },
  festival: {
    label: "College Festival",
    font: "Arial",
    background: "linear-gradient(145deg, #7c2d12, #be123c 48%, #581c87)",
    overlay: "linear-gradient(180deg, rgba(88,28,135,.22), rgba(67,20,7,.88))",
    titlePosition: "top"
  },
  culture: {
    label: "Cultural Event",
    font: "Verdana",
    background: "linear-gradient(145deg, #78350f, #9d174d 52%, #312e81)",
    overlay: "linear-gradient(180deg, rgba(49,46,129,.18), rgba(69,10,10,.9))",
    titlePosition: "middle"
  },
  competition: {
    label: "Competition",
    font: "Tahoma",
    background: "linear-gradient(145deg, #064e3b, #0f766e 52%, #172554)",
    overlay: "linear-gradient(180deg, rgba(6,78,59,.16), rgba(15,23,42,.92))",
    titlePosition: "bottom"
  }
};
const flyerElementLabels = {
  title: "Event title",
  subtitle: "Subtitle",
  description: "Description",
  highlights: "Highlights",
  prizes: "Prizes",
  dateTime: "Date and time",
  venue: "Venue",
  speaker: "Speaker",
  department: "Department",
  audience: "Audience"
};
const flyerFonts = ["Arial", "Georgia", "Trebuchet MS", "Verdana", "Tahoma", "Times New Roman", "Courier New"];
const textPresets = ["#ffffff", "#fef3c7", "#fde68a", "#bfdbfe", "#bbf7d0", "#fecaca", "#111827", "#1e3a8a"];

async function getHtml2Canvas() {
  try {
    const mod = await import("html2canvas");
    return mod.default || mod;
  } catch {
    return null;
  }
}

const getSavedFlyerData = (eventData) => {
  if (typeof eventData.flyerData !== "string") return {};
  try {
    const parsed = JSON.parse(eventData.flyerData);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const resolveEventRegistrationUrl = (eventData = {}) => {
  const candidates = [
    eventData.externalRegistrationUrl,
    eventData.qrCodeUrl,
    eventData.registrationUrl,
    getSavedFlyerData(eventData).registrationUrl,
    getSavedFlyerData(eventData).qrCodeUrl
  ];

  for (const candidate of candidates) {
    if (typeof candidate !== "string") continue;
    const trimmed = candidate.trim();
    if (!trimmed) continue;
    try {
      const parsed = new URL(trimmed);
      if (["http:", "https:"].includes(parsed.protocol)) {
        return parsed.href;
      }
    } catch {
      // Ignore malformed URLs until the form validates them.
    }
  }
  return "";
};

export const FlyerCreatorModal = ({ eventData = {}, onSaveFlyer, onClose, readOnly = false }) => {
  const { user, saveEventArtwork, saveEventCollegeLogo } = useAuth();
  const savedFlyerData = getSavedFlyerData(eventData);
  const canEdit = canEditEventArtwork(user, eventData, readOnly);
  const isSeminar = eventData.type === "seminar";

  const title = eventData.title || "";
  const category = eventData.programmeType || eventData.category || "";
  const department = eventData.department || "";
  const date = getEventDateLabel(eventData);
  const time = eventData.time || "";
  const venue = eventData.venue || "";
  const targetAudience = eventData.targetAudience || "";
  let highlights = eventData.highlights || "";
  try {
    const parsedHighlights = JSON.parse(highlights);
    if (Array.isArray(parsedHighlights)) highlights = parsedHighlights.filter(Boolean).join(" • ");
  } catch {
    // Keep legacy plain-text highlights as entered.
  }
  const sourceText = {
    title,
    subtitle: eventData.subHeadline || "",
    description: eventData.description || "",
    highlights,
    prizes: eventData.prizes || "",
    dateTime: [date, time].filter(Boolean).join(" • "),
    venue,
    speaker: eventData.resourcePerson || "",
    department,
    audience: targetAudience
  };

  const registrationUrl = resolveEventRegistrationUrl(eventData);
  const [posterImage, setPosterImage] = useState(savedFlyerData.imageDataUrl || "");
  const [coverImage, setCoverImage] = useState(eventData.proposedCoverImage || eventData.image || "");
  const [collegeLogo, setCollegeLogo] = useState(eventData.collegeLogo || "");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [artworkKind, setArtworkKind] = useState("flyer");
  const [versions, setVersions] = useState(() => {
    try {
      const parsed = JSON.parse(eventData.flyerVersions || "[]");
      return Array.isArray(parsed)
        ? parsed.map((version) => ({ ...version, kind: version.kind === "cover" ? "cover" : "flyer" }))
        : [];
    } catch {
      return [];
    }
  });
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageKind, setMessageKind] = useState("info");
  const [saving, setSaving] = useState(false);
  const [selectedElement, setSelectedElement] = useState("title");
  const [designChanged, setDesignChanged] = useState(() => Boolean(
    isValidFlyerDesign(savedFlyerData.design) &&
    (savedFlyerData.design.template !== "academic" ||
      savedFlyerData.design.titlePosition !== "bottom" ||
      Object.keys(savedFlyerData.design.styles).length ||
      Object.keys(savedFlyerData.design.text).length)
  ));
  const [flyerDesign, setFlyerDesign] = useState(() => isValidFlyerDesign(savedFlyerData.design)
    ? savedFlyerData.design
    : { template: "academic", titlePosition: "bottom", styles: {}, text: {} });
  const [reviewStatus, setReviewStatus] = useState(eventData.flyerReviewStatus || "not_submitted");
  const [reviewMessage, setReviewMessage] = useState(eventData.flyerReviewMessage || "");
  const [backgroundUrl, setBackgroundUrl] = useState("");
  const flyerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    if (!registrationUrl) {
      setQrDataUrl("");
      return () => {
        cancelled = true;
      };
    }

    QRCode.toDataURL(registrationUrl, {
      margin: 1,
      width: 220,
      color: {
        dark: "#0f172a",
        light: "#ffffff"
      }
    }).then((dataUrl) => {
      if (!cancelled) setQrDataUrl(dataUrl);
    }).catch(() => {
      if (!cancelled) setQrDataUrl("");
    });

    return () => {
      cancelled = true;
    };
  }, [registrationUrl]);
  const currentTemplate = flyerTemplates[flyerDesign.template] || flyerTemplates.academic;
  const selectedStyle = flyerDesign.styles[selectedElement] || {};
  const getText = (key) => flyerDesign.text[key] ?? sourceText[key];
  const getTextStyle = (key, defaults = {}) => {
    const style = flyerDesign.styles[key] || {};
    const baseFontSize = style.fontSize || defaults.fontSize || 16;
    const titleFit = key === "title"
      ? Math.max(0.45, 1 - Math.max(0, (getText("title") || "").length - 24) / 140)
      : 1;
    return {
      fontFamily: style.fontFamily || currentTemplate.font,
      fontSize: Math.max(14, baseFontSize * titleFit),
      fontWeight: style.fontWeight || defaults.fontWeight || "500",
      color: style.color || defaults.color || "#ffffff",
      textAlign: style.alignment || defaults.alignment || "left",
      lineHeight: style.lineHeight || defaults.lineHeight || 1.2,
      marginTop: style.offset ?? defaults.offset ?? 0,
      marginBottom: style.spacing ?? defaults.spacing ?? 0,
      textShadow: style.shadow ? "0 2px 8px rgba(0,0,0,.9)" : undefined,
      WebkitTextStroke: style.outline ? "1px rgba(2,6,23,.85)" : undefined,
      backgroundColor: style.background ? "rgba(2,6,23,.55)" : undefined,
      padding: style.background ? "0.12em 0.28em" : undefined,
      borderRadius: style.background ? "0.25em" : undefined,
      overflowWrap: "anywhere",
      maxWidth: "100%"
    };
  };
  const updateDesign = (update) => {
    setFlyerDesign((current) => ({ ...current, ...update }));
    setDesignChanged(true);
  };
  const updateSelectedStyle = (key, value) => {
    setFlyerDesign((current) => ({
      ...current,
      styles: { ...current.styles, [selectedElement]: { ...current.styles[selectedElement], [key]: value } }
    }));
    setDesignChanged(true);
  };
  const updateSelectedText = (value) => {
    setFlyerDesign((current) => ({ ...current, text: { ...current.text, [selectedElement]: value } }));
    setDesignChanged(true);
  };
  const canExportCurrentFlyer = canEdit
    ? Boolean(posterImage && (artworkKind !== "flyer" || collegeLogo))
    : Boolean(eventData.selectedFlyerImage);

  const handleGenerateFlyer = async () => {
    if (!canEdit) return;
    if (!eventData.id) {
      setMessageKind("error");
      setMessage("Save and submit this event first. You can generate artwork from My Submissions.");
      return;
    }

    setGenerating(true);
    setMessage("");
    setMessageKind("info");

    try {
      const response = await fetch(artworkKind === "flyer"
        ? "/api/gemini/generate-flyer"
        : "/api/gemini/generate-cover-artwork", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: eventData.id })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success || !data.imageDataUrl) {
        const messageByStatus = {
          401: "Your session has expired. Sign in again to generate artwork.",
          403: "Your Faculty account or event is not authorized to generate this artwork.",
          404: "The configured Gemini image model is unavailable or not enabled for this API key.",
          429: "Gemini image-generation quota is exhausted or unavailable. Check your model quota and retry."
        };
        const error = new Error(data.message || messageByStatus[response.status] || "The server did not return a poster image.");
        error.status = response.status;
        throw error;
      }

      if (!/^data:image\/(jpeg|png|webp);base64,/.test(data.imageDataUrl)) {
        throw new Error("The image-generation service returned an unsupported image format.");
      }
      const newVersion = {
        id: Date.now(),
        imageDataUrl: data.imageDataUrl,
        kind: artworkKind
      };

        if (artworkKind === "flyer") setPosterImage(data.imageDataUrl);
        else setCoverImage(data.imageDataUrl);
        if (artworkKind === "flyer" && !designChanged) {
          const templateKeys = Object.keys(flyerTemplates).filter((key) => key !== flyerDesign.template);
          const nextTemplate = templateKeys[Math.floor(Math.random() * templateKeys.length)];
          setFlyerDesign((current) => ({ ...current, template: nextTemplate, titlePosition: flyerTemplates[nextTemplate].titlePosition }));
      }
      setVersions((old) => [newVersion, ...old]);
      setMessageKind("success");
      setMessage(`New ${artworkKind === "flyer" ? "flyer artwork generated. Your template, typography, and text edits were retained." : "cover artwork generated."}`);
    } catch (error) {
      if (error instanceof TypeError) {
        setMessageKind("error");
        setMessage("Could not reach the artwork service. Check your network connection and try again.");
      } else {
        setMessageKind("error");
        setMessage(error instanceof Error ? error.message : "Flyer generation failed.");
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleBackgroundUrl = async () => {
    let url;
    try {
      url = new URL(backgroundUrl);
    } catch {
      setMessageKind("error");
      setMessage("Enter a complete, valid image URL beginning with https:// or http://.");
      return;
    }
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) {
      setMessageKind("error");
      setMessage("Only public HTTP or HTTPS image URLs are supported.");
      return;
    }

    setMessageKind("info");
    setMessage("Checking that the image is directly accessible...");
    try {
      const response = await fetch(url.href, { mode: "cors", credentials: "omit" });
      if (!response.ok) throw new Error(`The image server returned HTTP ${response.status}.`);
      const responseUrl = new URL(response.url);
      if (!["https:", "http:"].includes(responseUrl.protocol)) {
        throw new Error("The image URL redirected to an unsupported address.");
      }
      const contentType = response.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
      if (!["image/png", "image/jpeg", "image/webp"].includes(contentType)) {
        throw new Error("That URL did not return a PNG, JPEG, or WebP image.");
      }
      const contentLength = Number(response.headers.get("content-length") || 0);
      if (contentLength > 8 * 1024 * 1024) throw new Error("The background image must be 8 MB or smaller.");
      const blob = await response.blob();
      if (blob.size === 0 || blob.size > 8 * 1024 * 1024) {
        throw new Error("The background image is empty or larger than 8 MB.");
      }
      const objectUrl = URL.createObjectURL(blob);
      try {
        await new Promise((resolve, reject) => {
          const image = new Image();
          image.onload = () => image.naturalWidth > 0 && image.naturalHeight > 0
            ? resolve()
            : reject(new Error("The image file could not be decoded."));
          image.onerror = () => reject(new Error("The image file could not be decoded."));
          image.src = objectUrl;
        });
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
      const imageDataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("The accessible image could not be read."));
        reader.readAsDataURL(blob);
      });
      setPosterImage(imageDataUrl);
      setArtworkKind("flyer");
      setMessageKind("success");
      setMessage("Background image loaded. It will be included in the preview, approval submission, and exports.");
    } catch (error) {
      setMessageKind("error");
      setMessage(error instanceof TypeError
        ? "This image is blocked or inaccessible from the browser. Use a direct image URL that allows cross-origin access."
        : error instanceof Error ? error.message : "Unable to load that background image.");
    }
  };

  const handleDownloadJPG = async () => {
    if (!canExportCurrentFlyer || !flyerRef.current) {
      setMessageKind("error");
      setMessage(artworkKind === "flyer" && !collegeLogo
        ? "Upload the official college logo before downloading the flyer."
        : "Generate or select real flyer artwork before downloading.");
      return false;
    }

    setDownloading(true);
    setMessage("");

    try {
      const html2canvas = await getHtml2Canvas();
      if (!html2canvas) {
        throw new Error('Install "html2canvas" to download the poster as JPG.');
      }

      const canvas = await html2canvas(flyerRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#101225",
        logging: false
      });
      if (canvas.width < 1 || canvas.height < 1) {
        throw new Error("The flyer preview is empty and cannot be downloaded.");
      }

      const link = document.createElement("a");
      link.download = `${title.trim().replace(/[^a-z0-9]+/gi, "_") || "Event"}_Flyer.jpg`;
      link.href = canvas.toDataURL("image/jpeg", 0.96);
      link.click();
      return true;
    } catch (error) {
      console.error("JPG download failed:", error);
      setMessage(error instanceof Error ? error.message : "Could not download the poster.");
      return false;
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!canExportCurrentFlyer || !flyerRef.current) {
      setMessageKind("error");
      setMessage(artworkKind === "flyer" && !collegeLogo
        ? "Upload the official college logo before exporting the flyer."
        : "Generate or select real flyer artwork before exporting a PDF.");
      return;
    }
    setDownloading(true);
    setMessage("");
    try {
      const html2canvas = await getHtml2Canvas();
      if (!html2canvas) throw new Error("Flyer rendering is unavailable in this browser.");
      const [{ jsPDF }, canvas] = await Promise.all([
        import("jspdf"),
        html2canvas(flyerRef.current, { scale: 2, useCORS: true, backgroundColor: "#101225", logging: false })
      ]);
      if (canvas.width < 1 || canvas.height < 1) {
        throw new Error("The flyer preview is empty and cannot be exported.");
      }
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const scale = Math.min(190 / canvas.width, 277 / canvas.height);
      const width = canvas.width * scale;
      const height = canvas.height * scale;
      pdf.addImage(canvas.toDataURL("image/jpeg", 0.96), "JPEG", (210 - width) / 2, 10, width, height);
      pdf.save(`${title.trim().replace(/[^a-z0-9]+/gi, "_") || "Event"}_Flyer.pdf`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not export the flyer as PDF.");
    } finally {
      setDownloading(false);
    }
  };

  const handleSaveSelected = async () => {
    if (!canEdit) return;
    if (!eventData.id) {
      setMessage("Save and submit this event before selecting artwork.");
      return;
    }
    const selectedImage = artworkKind === "flyer" ? posterImage : coverImage;
    if (artworkKind === "flyer" && !collegeLogo) {
      setMessageKind("error");
      setMessage("Upload the official college logo before submitting the flyer for Principal approval.");
      return;
    }
    if (!selectedImage) {
      setMessage(`Generate or select ${artworkKind === "flyer" ? "flyer" : "cover"} artwork first.`);
      return;
    }
    setSaving(true);
    setMessageKind("info");
    setMessage("");
    let composedFlyer = selectedImage;
    if (artworkKind === "flyer") {
      try {
        const html2canvas = await getHtml2Canvas();
        if (!html2canvas || !flyerRef.current) throw new Error("Flyer rendering is unavailable in this browser.");
        const canvas = await html2canvas(flyerRef.current, {
          scale: 1.5,
          useCORS: true,
          backgroundColor: "#101225"
        });
        composedFlyer = canvas.toDataURL("image/jpeg", 0.92);
      } catch (error) {
        setMessageKind("error");
        setMessage(error instanceof Error ? error.message : "Could not render the complete flyer for review.");
        setSaving(false);
        return;
      }
    }
    const finalRegistrationUrl = resolveEventRegistrationUrl({
      ...eventData,
      externalRegistrationUrl: eventData.externalRegistrationUrl || eventData.qrCodeUrl || eventData.registrationUrl,
      qrCodeUrl: eventData.qrCodeUrl || eventData.externalRegistrationUrl || eventData.registrationUrl,
      registrationUrl: eventData.registrationUrl || eventData.qrCodeUrl || eventData.externalRegistrationUrl
    });
    const result = await saveEventArtwork(eventData.id, {
      kind: artworkKind,
      imageDataUrl: composedFlyer,
      artworkDataUrl: artworkKind === "flyer" ? selectedImage : undefined,
      flyerVersions: artworkKind === "flyer" ? JSON.stringify(versions) : undefined,
      flyerDesign: artworkKind === "flyer" ? {
        ...flyerDesign,
        registrationUrl: finalRegistrationUrl || undefined,
        qrCodeUrl: finalRegistrationUrl || undefined
      } : undefined,
      collegeLogo: undefined,
      qrCodeUrl: finalRegistrationUrl || undefined,
      externalRegistrationUrl: finalRegistrationUrl || undefined
    });
    setSaving(false);
    if (!result.success) {
      setMessageKind("error");
      setMessage(result.message || "Unable to submit artwork for review.");
      return;
    }
    setReviewStatus("pending_review");
    setReviewMessage("");
    onSaveFlyer?.({
      flyerData: JSON.stringify({ ...savedFlyerData, imageDataUrl: selectedImage, design: flyerDesign }),
      flyerVersions: eventData.flyerVersions || "",
      selectedFlyerImage: selectedImage
    });
    setMessageKind("success");
    setMessage("Flyer submitted to the Principal for review. Status: Pending review.");
  };

  const handleShare = async () => {
    try {
      if (!canExportCurrentFlyer || !flyerRef.current) {
        setMessageKind("error");
        setMessage(artworkKind === "flyer" && !collegeLogo
          ? "Upload the official college logo before sharing the flyer."
          : "Generate or select real flyer artwork before sharing.");
        return;
      }
      const html2canvas = await getHtml2Canvas();
      if (!html2canvas || !flyerRef.current) throw new Error("The flyer preview is unavailable.");
      const canvas = await html2canvas(flyerRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#101225",
        logging: false
      });
      const blob = await new Promise((resolve, reject) => canvas.toBlob(
        (result) => result ? resolve(result) : reject(new Error("Could not prepare the flyer image for sharing.")),
        "image/png"
      ));
      const file = new File([blob], `${title.trim().replace(/[^a-z0-9]+/gi, "_") || "Event"}_Flyer.png`, { type: "image/png" });
      if (navigator.share && navigator.canShare) {
        if (navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title,
              text: [title, date, time, venue].filter(Boolean).join(" • "),
              files: [file]
            });
            return;
          } catch (error) {
            if (error?.name === "AbortError") return;
          }
        }
      }

      const eventInfo = [title, date, time, venue, window.location.href].filter(Boolean).join("\n");
      let copied = false;
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(eventInfo);
          copied = true;
        }
      } catch {
        copied = false;
      }
      const link = document.createElement("a");
      const objectUrl = URL.createObjectURL(blob);
      link.href = objectUrl;
      link.download = file.name;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
      setMessage(copied
        ? "Native sharing is unavailable. The flyer was downloaded and event details were copied."
        : "Native sharing and clipboard access are unavailable. The flyer was downloaded.");
    } catch (error) {
      if (error?.name === "AbortError") return;
      setMessage(error instanceof Error ? error.message : "Unable to share the flyer.");
    }
  };

  const handleDownloadSavedFlyer = () => {
    const extension = /^data:image\/(png|jpeg|webp);/.exec(eventData.selectedFlyerImage || "")?.[1] || "jpg";
    const link = document.createElement("a");
    link.href = eventData.selectedFlyerImage;
    link.download = `${title.trim().replace(/[^a-z0-9]+/gi, "_") || "Event"}_Flyer.${extension === "jpeg" ? "jpg" : extension}`;
    link.click();
  };

  if (!canEdit) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-3 sm:p-5">
        <div className="my-4 flex max-h-[95vh] w-full max-w-3xl flex-col overflow-y-auto rounded-3xl bg-white shadow-2xl">
          <header className="flex items-center justify-between border-b p-4">
            <h2 className="font-black text-gray-900">{eventData.title || "Approved Event Flyer"}</h2>
            <button onClick={onClose} className="rounded-full p-2 text-gray-500 hover:bg-gray-100" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </header>
          <div ref={flyerRef} className="mx-auto max-h-[75vh] w-full max-w-lg bg-slate-950 p-3">
            {eventData.selectedFlyerImage
              ? <img src={eventData.selectedFlyerImage} alt={`Approved flyer for ${eventData.title}`} className="mx-auto max-h-[72vh] w-full object-contain" />
              : <p className="p-8 text-center text-sm text-white">No approved flyer is available for this event.</p>}
          </div>
          {eventData.selectedFlyerImage && (
            <div className="flex justify-center gap-2 p-4">
              <button onClick={handleDownloadSavedFlyer} className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white">Download JPG</button>
              <button onClick={handleDownloadPDF} disabled={downloading} className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white disabled:opacity-50">Download PDF</button>
              <button onClick={handleShare} className="rounded-xl bg-gray-100 px-4 py-2 text-xs font-bold text-gray-800">Share</button>
            </div>
          )}
          {message && <p role="status" className="mx-4 mb-4 rounded-lg bg-slate-100 p-3 text-xs text-slate-700">{message}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-3 sm:p-5">
      <div className="my-4 flex max-h-[95vh] w-full max-w-6xl flex-col overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b bg-white p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-red-100 p-2.5 text-red-600"><Sparkles className="h-5 w-5" /></div>
            <div>
              <h2 className="font-black text-gray-900">{isSeminar ? "AI Seminar Poster Studio" : "AI Event Poster Studio"}</h2>
              <p className="text-xs text-gray-500">Generate fresh, event-specific artwork</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-gray-500 hover:bg-gray-100" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="grid grid-cols-1 gap-6 bg-slate-50 p-4 sm:p-6 lg:grid-cols-12">
          <section className="lg:col-span-7">
            <div
              ref={flyerRef}
              className="relative mx-auto flex aspect-[2/3] w-full max-w-[520px] flex-col overflow-hidden rounded-2xl text-white shadow-2xl"
              style={{ background: currentTemplate.background }}
            >
              {posterImage && <img src={posterImage} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />}
              <div className="absolute inset-0" style={{ background: currentTemplate.overlay }} />
              <div className="relative z-[1] flex flex-1 flex-col p-6 sm:p-8">
                <div className="flex items-start justify-between gap-3 border-b border-white/25 pb-4">
                  <div className="flex items-center gap-2">
                    <img src={websiteLogo} alt="OurCampus Connect logo" className="h-10 w-10 rounded-full object-contain" />
                    {collegeLogo && <img src={collegeLogo} alt="Uploaded college logo" className="h-10 w-10 rounded-full object-contain" />}
                    <div>
                      {collegeLogo && <p className="text-xs font-black tracking-wide">R. K. TALREJA COLLEGE</p>}
                      <p className="text-[10px] text-white/75">OurCampus Connect</p>
                    </div>
                  </div>
                  <span className="rounded-full border border-white/40 bg-black/30 px-3 py-1 text-[10px] font-bold uppercase">
                    {category || "COLLEGE EVENT"}
                  </span>
                </div>

                {qrDataUrl && (
                  <div className="absolute bottom-5 right-5 z-[2] rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-lg">
                    <img src={qrDataUrl} alt="Registration QR code" className="h-20 w-20 rounded-xl object-contain bg-white" />
                  </div>
                )}

                <div className={`flex flex-1 flex-col py-5 ${{
                  top: "justify-start",
                  middle: "justify-center",
                  bottom: "justify-end"
                }[flyerDesign.titlePosition] || "justify-end"}`}>
                  {getText("subtitle") && <p
                    onClick={() => setSelectedElement("subtitle")}
                    className="mb-3 cursor-pointer text-xs font-black uppercase tracking-[.18em] text-amber-300"
                    style={getTextStyle("subtitle", { fontSize: 12, fontWeight: "800", color: "#fcd34d", spacing: 12 })}
                  >
                    {getText("subtitle")}
                  </p>}
                  <h1
                    onClick={() => setSelectedElement("title")}
                    className="cursor-pointer whitespace-pre-wrap break-words font-black drop-shadow-lg"
                    style={getTextStyle("title", { fontSize: 40, fontWeight: "900", lineHeight: 1.05 })}
                  >
                    {getText("title") || "YOUR EVENT TITLE"}
                  </h1>
                  {getText("description") && <p
                    onClick={() => setSelectedElement("description")}
                    className="mt-4 cursor-pointer whitespace-pre-wrap"
                    style={getTextStyle("description", { fontSize: 14, color: "#f8fafc", lineHeight: 1.45, spacing: 8 })}
                  >{getText("description")}</p>}
                  {getText("highlights") && <p
                    onClick={() => setSelectedElement("highlights")}
                    className="mt-2 cursor-pointer whitespace-pre-wrap"
                    style={getTextStyle("highlights", { fontSize: 12, fontWeight: "600", color: "#fef3c7" })}
                  >Highlights: {getText("highlights")}</p>}
                  {getText("prizes") && <p
                    onClick={() => setSelectedElement("prizes")}
                    className="mt-2 cursor-pointer whitespace-pre-wrap"
                    style={getTextStyle("prizes", { fontSize: 12, fontWeight: "600", color: "#fef3c7" })}
                  >Prizes: {getText("prizes")}</p>}
                  {getText("speaker") && <p
                    onClick={() => setSelectedElement("speaker")}
                    className="mt-3 cursor-pointer whitespace-pre-wrap"
                    style={getTextStyle("speaker", { fontSize: 14, fontWeight: "700", color: "#fde68a" })}
                  >Speaker: {getText("speaker")}</p>}
                </div>

                <div className="pt-4">
                  <div className="grid grid-cols-2 gap-3 border-t border-white/30 pt-4 text-xs">
                    <div>
                      <p className="font-bold text-amber-300">DATE & TIME</p>
                      <p onClick={() => setSelectedElement("dateTime")} className="mt-1 cursor-pointer whitespace-pre-wrap" style={getTextStyle("dateTime", { fontSize: 12 })}>{getText("dateTime") || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="font-bold text-amber-300">VENUE</p>
                      <p onClick={() => setSelectedElement("venue")} className="mt-1 cursor-pointer break-words" style={getTextStyle("venue", { fontSize: 12 })}>{getText("venue") || "Not provided"}</p>
                    </div>
                  </div>
                  <div className="mt-5 flex items-end justify-between gap-3 border-t border-white/20 pt-3">
                    <div>
                      <p onClick={() => setSelectedElement("department")} className="cursor-pointer text-[10px] font-bold uppercase text-white/65" style={getTextStyle("department", { fontSize: 10, fontWeight: "700", color: "#e2e8f0" })}>{getText("department")}</p>
                      <p className="mt-1 text-xs font-black">OurCampus Connect</p>
                    </div>
                    <p onClick={() => setSelectedElement("audience")} className="max-w-[45%] cursor-pointer text-right text-[10px] text-white/75" style={getTextStyle("audience", { fontSize: 10, color: "#e2e8f0" })}>For: {getText("audience") || "Not specified"}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-4 lg:col-span-5">
            <div className="space-y-4 rounded-2xl border bg-white p-4 sm:p-5">
              <h3 className="font-black text-gray-900">Flyer artwork</h3>
              <p className="text-xs leading-relaxed text-gray-600">Event facts are taken directly from this event and shown on the poster preview. Generate original artwork, then review and submit it to the Principal.</p>
              {canEdit && !eventData.id && <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-900">Submit this event first, then open it from My Submissions to create and save artwork.</p>}
              {canEdit && !collegeLogo && <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">Upload the official college logo to include it in the final flyer. The OurCampus Connect logo is included separately.</p>}
              {canEdit && !posterImage && eventData.selectedFlyerImage && <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">This approved flyer has no saved editable background. Generate new artwork or load a permitted image URL to create your revision.</p>}
              <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 text-xs text-slate-700">
                <p className="font-bold text-slate-900">{title || "Untitled event"}</p>
                <p className="mt-1">{date || "Date not set"}{time ? ` • ${time}` : ""}</p>
                <p className="mt-1">{venue || "Venue not set"} • {targetAudience || "Audience not set"}</p>
              </div>
              <div className="rounded-xl border bg-white p-3 text-xs">
                <p className="font-bold text-slate-900">Principal review status: <span className={reviewStatus === "approved" ? "text-emerald-700" : reviewStatus === "changes_requested" || reviewStatus === "rejected" ? "text-amber-800" : "text-slate-700"}>
                  {reviewStatus === "not_submitted" ? "Not submitted" : reviewStatus.replaceAll("_", " ")}
                </span></p>
                {reviewMessage && <p className="mt-1 whitespace-pre-wrap text-amber-900">{reviewMessage}</p>}
              </div>

              {canEdit && <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setArtworkKind("flyer")} className={`rounded-xl px-3 py-2 text-xs font-bold ${artworkKind === "flyer" ? "bg-slate-900 text-white" : "bg-gray-100 text-gray-700"}`}>Factual flyer</button>
                <button type="button" onClick={() => setArtworkKind("cover")} className={`rounded-xl px-3 py-2 text-xs font-bold ${artworkKind === "cover" ? "bg-slate-900 text-white" : "bg-gray-100 text-gray-700"}`}>Cover artwork</button>
              </div>}
              {canEdit && artworkKind === "flyer" && <>
                <section className="space-y-3 rounded-xl border bg-white p-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Browse flyer templates</h4>
                    <p className="text-[11px] text-slate-500">Choose a layout and colour direction. Your event facts remain editable.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {Object.entries(flyerTemplates).map(([key, template]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => updateDesign({ template: key, titlePosition: template.titlePosition })}
                        aria-pressed={flyerDesign.template === key}
                        className={`overflow-hidden rounded-lg border-2 text-left text-[11px] font-bold ${flyerDesign.template === key ? "border-blue-600 ring-2 ring-blue-100" : "border-slate-200"}`}
                      >
                        <span className="relative flex h-20 flex-col justify-end gap-1 overflow-hidden p-2" style={{ background: template.background }}>
                          <span className="absolute inset-0" style={{ background: template.overlay }} />
                          <span className="relative h-1 w-1/3 rounded bg-amber-300" />
                          <span className="relative h-2 w-4/5 rounded bg-white" />
                          <span className="relative h-1 w-2/3 rounded bg-white/70" />
                        </span>
                        <span className="block p-2 text-slate-800">{template.label}</span>
                      </button>
                    ))}
                  </div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Title placement
                    <select value={flyerDesign.titlePosition} onChange={(event) => updateDesign({ titlePosition: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2">
                      <option value="top">Top</option>
                      <option value="middle">Centre</option>
                      <option value="bottom">Bottom</option>
                    </select>
                  </label>
                </section>

                <section className="space-y-2 rounded-xl border bg-white p-3">
                  <h4 className="text-sm font-bold text-slate-900">Browse template by URL</h4>
                  <p className="text-[11px] text-slate-500">Use a direct, publicly accessible PNG, JPEG, or WebP image URL you have permission to use.</p>
                  <div className="flex gap-2">
                    <input type="url" value={backgroundUrl} onChange={(event) => setBackgroundUrl(event.target.value)} placeholder="https://example.com/image.jpg" className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs" />
                    <button type="button" onClick={handleBackgroundUrl} className="rounded-lg bg-blue-700 px-3 py-2 text-xs font-bold text-white">Load</button>
                  </div>
                </section>

                <section className="space-y-3 rounded-xl border bg-white p-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Edit text and styling</h4>
                    <p className="text-[11px] text-slate-500">Click text in the preview or choose an element. Changes apply only to that element.</p>
                  </div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Text element
                    <select value={selectedElement} onChange={(event) => setSelectedElement(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2">
                      {Object.entries(flyerElementLabels).filter(([key]) => sourceText[key]).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                    </select>
                  </label>
                  <label className="block text-xs font-semibold text-slate-700">
                    Text content
                    <textarea value={getText(selectedElement) || ""} onChange={(event) => updateSelectedText(event.target.value)} rows={selectedElement === "description" ? 3 : 2} maxLength={selectedElement === "title" ? 160 : 1200} className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs font-normal" />
                    <span className="font-normal text-slate-500">Check all event facts before submitting for review.</span>
                  </label>
                  <label className="block text-xs font-semibold text-slate-700">
                    Font family
                    <select value={selectedStyle.fontFamily || currentTemplate.font} onChange={(event) => updateSelectedStyle("fontFamily", event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2">
                      {flyerFonts.map((font) => <option key={font} value={font}>{font}</option>)}
                    </select>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="text-xs font-semibold text-slate-700">
                      Font size: {selectedStyle.fontSize || (selectedElement === "title" ? 40 : 14)} px
                      <input type="range" min="10" max="72" value={selectedStyle.fontSize || (selectedElement === "title" ? 40 : 14)} onChange={(event) => updateSelectedStyle("fontSize", Number(event.target.value))} className="mt-2 w-full" />
                    </label>
                    <label className="text-xs font-semibold text-slate-700">
                      Font weight
                      <select value={selectedStyle.fontWeight || (selectedElement === "title" ? "900" : "500")} onChange={(event) => updateSelectedStyle("fontWeight", event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2">
                        {["400", "500", "600", "700", "800", "900"].map((weight) => <option key={weight} value={weight}>{weight}</option>)}
                      </select>
                    </label>
                  </div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Text alignment
                    <select value={selectedStyle.alignment || (selectedElement === "audience" ? "right" : "left")} onChange={(event) => updateSelectedStyle("alignment", event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2">
                      <option value="left">Left</option>
                      <option value="center">Centre</option>
                      <option value="right">Right</option>
                    </select>
                  </label>
                  <div>
                    <p className="mb-1 text-xs font-semibold text-slate-700">Text colour</p>
                    <div className="flex flex-wrap items-center gap-2">
                      {textPresets.map((color) => <button key={color} type="button" aria-label={`Use ${color} text`} aria-pressed={(selectedStyle.color || "#ffffff") === color} onClick={() => updateSelectedStyle("color", color)} className="h-7 w-7 rounded-full border border-slate-300" style={{ backgroundColor: color }} />)}
                      <input type="color" aria-label="Custom text colour" value={selectedStyle.color || "#ffffff"} onChange={(event) => updateSelectedStyle("color", event.target.value)} className="h-8 w-10 cursor-pointer rounded border border-slate-300 p-0.5" />
                    </div>
                  </div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Line spacing: {(selectedStyle.lineHeight || (selectedElement === "title" ? 1.05 : 1.2)).toFixed(2)}
                    <input type="range" min="0.9" max="2" step="0.05" value={selectedStyle.lineHeight || (selectedElement === "title" ? 1.05 : 1.2)} onChange={(event) => updateSelectedStyle("lineHeight", Number(event.target.value))} className="mt-2 w-full" />
                  </label>
                  <label className="block text-xs font-semibold text-slate-700">
                    Spacing after text: {selectedStyle.spacing || 0}px
                    <input type="range" min="0" max="48" value={selectedStyle.spacing || 0} onChange={(event) => updateSelectedStyle("spacing", Number(event.target.value))} className="mt-2 w-full" />
                  </label>
                  <label className="block text-xs font-semibold text-slate-700">
                    Position below previous text: {selectedStyle.offset || 0}px
                    <input type="range" min="0" max="48" value={selectedStyle.offset || 0} onChange={(event) => updateSelectedStyle("offset", Number(event.target.value))} className="mt-2 w-full" />
                  </label>
                  <div className="flex flex-wrap gap-3 text-xs text-slate-700">
                    <label className="flex items-center gap-1"><input type="checkbox" checked={Boolean(selectedStyle.shadow)} onChange={(event) => updateSelectedStyle("shadow", event.target.checked)} /> Shadow</label>
                    <label className="flex items-center gap-1"><input type="checkbox" checked={Boolean(selectedStyle.outline)} onChange={(event) => updateSelectedStyle("outline", event.target.checked)} /> Outline</label>
                    <label className="flex items-center gap-1"><input type="checkbox" checked={Boolean(selectedStyle.background)} onChange={(event) => updateSelectedStyle("background", event.target.checked)} /> Text background</label>
                  </div>
                  <button type="button" onClick={() => {
                    setFlyerDesign((current) => ({
                      ...current,
                      template: "academic",
                      titlePosition: "bottom",
                      text: {},
                      styles: {}
                    }));
                    setDesignChanged(false);
                    setMessageKind("info");
                    setMessage("Default flyer styling restored.");
                  }} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700">Restore default styling</button>
                </section>
              </>}
              {canEdit && artworkKind === "flyer" && (
                <div className="space-y-2">
                  <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-blue-300 bg-white px-4 py-2.5 text-xs font-bold text-blue-800 shadow-sm transition hover:bg-blue-50 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500">
                    <Upload className="h-4 w-4" />
                    {collegeLogo ? "Replace College Logo" : "Upload College Logo"}
                    <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" aria-label="Upload or replace college logo" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 4 * 1024 * 1024) {
                      setMessage("College logo must be 4 MB or smaller.");
                      e.target.value = "";
                      return;
                    }
                    const reader = new FileReader();
                    reader.onload = async () => {
                      const imageDataUrl = String(reader.result);
                      if (!eventData.id) {
                        setMessageKind("error");
                        setMessage("Save the event before managing its college logo.");
                        return;
                      }
                      setMessageKind("info");
                      setMessage("Saving the college logo...");
                      const result = await saveEventCollegeLogo(eventData.id, imageDataUrl);
                      if (result.success) {
                        setCollegeLogo(imageDataUrl);
                        setMessageKind("success");
                        setMessage("College logo saved separately from the OurCampus Connect logo.");
                      } else {
                        setMessageKind("error");
                        setMessage(result.message || "Unable to save the college logo.");
                      }
                    };
                    reader.onerror = () => {
                      setMessageKind("error");
                      setMessage("Could not read the selected logo file.");
                    };
                    reader.readAsDataURL(file);
                  }} />
                  </label>
                  {collegeLogo && <img src={collegeLogo} alt="Selected college logo preview" className="h-16 w-16 rounded-lg border bg-white object-contain p-1" />}
                </div>
              )}
              {artworkKind === "cover" && coverImage && (
                <img src={coverImage} alt="Selected cover artwork preview" className="max-h-32 w-full rounded-lg object-cover" />
              )}

              {canEdit && <button onClick={handleGenerateFlyer} disabled={generating || !eventData.id} aria-busy={generating} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 px-4 py-3 text-sm font-bold text-white shadow-md transition hover:from-blue-800 hover:via-indigo-800 hover:to-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60">
                {generating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {generating ? "Generating new artwork..." : artworkKind === "flyer" ? posterImage ? "Regenerate Flyer Artwork" : "Generate Flyer Artwork" : coverImage ? "Regenerate Cover Artwork" : "Generate Cover Artwork"}
              </button>}

              <div className="grid grid-cols-2 gap-2">
                <button onClick={handleDownloadJPG} disabled={downloading || !canExportCurrentFlyer} className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-3 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">
                  <Download className="h-4 w-4" /> {downloading ? "Preparing..." : "Download JPG"}
                </button>
                <button onClick={handleDownloadPDF} disabled={downloading || !canExportCurrentFlyer} className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-3 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">
                  <Download className="h-4 w-4" /> {downloading ? "Preparing..." : "Download PDF"}
                </button>
                <button onClick={handleShare} disabled={!canExportCurrentFlyer} className="flex items-center justify-center gap-2 rounded-xl bg-gray-100 px-3 py-3 text-xs font-bold text-gray-800 disabled:cursor-not-allowed disabled:opacity-50">
                  <Share2 className="h-4 w-4" /> Share
                </button>
              </div>

              {generating && <p role="status" aria-live="polite" className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900">Generating original artwork with Gemini. This may take a moment…</p>}
              {message && <p role={messageKind === "error" ? "alert" : "status"} aria-live={messageKind === "error" ? "assertive" : "polite"} className={`rounded-lg p-3 text-xs ${messageKind === "success" ? "border border-emerald-200 bg-emerald-50 text-emerald-800" : messageKind === "error" ? "border border-red-200 bg-red-50 text-red-800" : "bg-slate-100 text-slate-700"}`}>{message}</p>}
            </div>

            {canEdit && versions.length > 0 && (
              <div className="rounded-2xl border bg-white p-4">
                <h3 className="mb-3 font-black text-gray-900">Generated versions ({versions.length})</h3>
                <div className="grid grid-cols-3 gap-2">
                  {versions.map((version, index) => (
                    <button key={version.id} onClick={() => {
                      setArtworkKind(version.kind);
                      if (version.kind === "flyer") setPosterImage(version.imageDataUrl);
                      else setCoverImage(version.imageDataUrl);
                    }} className="overflow-hidden rounded-lg border-2 border-transparent hover:border-red-500" title={`Use generated ${version.kind} version ${index + 1}`}>
                      <img src={version.imageDataUrl} alt={`Generated ${version.kind} version ${index + 1}`} className="aspect-[2/3] w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {canEdit && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="flex items-center gap-2 text-sm font-black text-amber-950"><CheckCircle2 className="h-4 w-4" /> Finalize poster</h3>
              <p className="my-2 text-xs leading-relaxed text-amber-900">Review the text and event details before saving. The artwork is AI-generated; the event details shown on top are kept as editable text.</p>
              <button onClick={handleSaveSelected} disabled={saving || !eventData.id} className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white hover:bg-emerald-700 disabled:opacity-50">{saving ? "Submitting..." : "Submit for Principal Review"}</button>
            </div>}
          </aside>
        </div>
      </div>
    </div>
  );
};
