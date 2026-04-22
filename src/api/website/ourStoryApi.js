import { apiFetch, apiPost } from './websiteBase';

export const getOurStory = () => apiFetch('get_our_story.php');
export const addOurStory = (data) => apiPost('add_our_story.php', data);
export const updateOurStory = (data) => apiPost('update_our_story.php', data);
export const deleteOurStory = (id) => apiPost('delete_our_story.php', { id });
