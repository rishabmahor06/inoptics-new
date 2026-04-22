import { apiFetch, apiPost, apiPostForm } from './websiteBase';

export const getPeopleComments = () => apiFetch('get_people_comments.php');
export const addPeopleComment = (fd) => apiPostForm('upload_people_comment.php', fd);
export const updatePeopleComment = (fd) => apiPostForm('update_people_comment.php', fd);
export const deletePeopleComment = (id) => apiPost('delete_people_comment.php', { id });
