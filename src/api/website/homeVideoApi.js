import { apiFetch, apiPost, apiPostForm } from './websiteBase';

export const getHomeVideos = () => apiFetch('get_home_video.php');
export const uploadHomeVideo = (fd) => apiPostForm('upload_home_video.php', fd);
export const deleteHomeVideo = (id) => apiPost('delete_home_video.php', { id });
