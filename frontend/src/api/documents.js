import { apiBlob } from "./client.js";

// сохранение blob как файла через временную ссылку
function triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}

async function download(path, fallbackName) {
    const { blob, filename } = await apiBlob(path);
    triggerDownload(blob, filename || fallbackName);
}

export const downloadRejection = (applicationId) =>
    download(`/documents/rejection/${applicationId}`, `otkaz-${applicationId}.pdf`);

export const downloadInvitation = (applicationId) =>
    download(`/documents/invitation/${applicationId}`, `priglashenie-${applicationId}.pdf`);

export const downloadOffer = (applicationId) =>
    download(`/documents/offer/${applicationId}`, `offer-${applicationId}.pdf`);

export const downloadInterviewProtocol = (interviewId) =>
    download(`/documents/interview-protocol/${interviewId}`, `protokol-${interviewId}.pdf`);

export const downloadCandidateCard = (candidateId) =>
    download(`/documents/candidate-card/${candidateId}`, `kartochka-${candidateId}.pdf`);
