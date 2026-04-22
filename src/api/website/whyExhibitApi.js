import { apiFetch, apiPost, apiPostForm } from './websiteBase';

export const getWhyExhibit = () => apiFetch('get_why_exhibit.php');
export const addWhyExhibit = (fd) => apiPostForm('add_why_exhibit.php', fd);
export const updateWhyExhibit = (fd) => apiPostForm('update_why_exhibit.php', fd);
export const deleteWhyExhibit = (id) => apiPost('delete_why_exhibit.php', { id });

export const getWhyExhibitImages = () => apiFetch('get_why_exhibit_image.php');
export const addWhyExhibitImage = (fd) => apiPostForm('add_why_exhibit_image.php', fd);
export const deleteWhyExhibitImage = (id) => apiPost('delete_why_exhibit_image.php', { id });

export const getWhyExhibitPDFs = () => apiFetch('get_whyexhibit_pdf.php');
export const addWhyExhibitPDF = (fd) => apiPostForm('add_whyexhibit_pdf.php', fd);
export const deleteWhyExhibitPDF = (id) => apiPost('delete_whyexhibit_pdf.php', { id });

export const getWhyExhibitBecomeExhibitor = () => apiFetch('get_why_exhibit_become_an_exhibitor.php');
export const addWhyExhibitBecomeExhibitor = (data) => apiPost('add_why_exhibit_become_an_exhibitor.php', data);
export const updateWhyExhibitBecomeExhibitor = (data) => apiPost('update_why_exhibit_become_an_exhibitor.php', data);
export const deleteWhyExhibitBecomeExhibitor = (id) => apiPost('delete_why_exhibit_become_an_exhibitor.php', { id });
