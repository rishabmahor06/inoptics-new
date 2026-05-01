import { apiFetch, apiPost, apiPostForm } from './websiteBase';

/* ============ helpers ============ */

/**
 * Convert YouTube / Vimeo / direct URLs into an embeddable URL the
 * <iframe> can autoplay-loop-mute. Direct .mp4/.webm/.mov etc. are kept as-is.
 */
export function normalizeVideoUrl(raw) {
  const url = String(raw || '').trim();
  if (!url) return '';

  // YouTube — youtu.be / watch / embed / shorts
  const ytMatch =
    url.match(/youtu\.be\/([\w-]+)/) ||
    url.match(/youtube\.com\/watch\?(?:.*&)?v=([\w-]+)/) ||
    url.match(/youtube\.com\/embed\/([\w-]+)/) ||
    url.match(/youtube\.com\/shorts\/([\w-]+)/);
  if (ytMatch) {
    const id = ytMatch[1];
    return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&controls=0&rel=0&modestbranding=1&playlist=${id}`;
  }

  // Vimeo
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) {
    return `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1&loop=1&muted=1&controls=0&background=1`;
  }

  // Direct video file or anything else — keep as-is
  return url;
}

/* ============ endpoints ============ */

export const getHomeVideos   = ()   => apiFetch('get_home_videos.php');
export const uploadHomeVideo = (fd) => apiPostForm('upload_home_video.php', fd);

/**
 * Send the link as multipart/form-data so PHP populates $_POST['video_url'].
 * URL is normalized client-side (YouTube watch → embed) before sending.
 */
export const uploadHomeVideoLink = (url) => {
  const fd = new FormData();
  fd.append('video_url', normalizeVideoUrl(url));
  return apiPostForm('upload_home_video.php', fd);
};

export const deleteHomeVideo = (id) => apiPost('delete_home_video.php', { id });
