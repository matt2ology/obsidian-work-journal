module.exports = async (params) => {
  const { quickAddApi: qa, variables, abort } = params;

  // Prompt user for input
  let originalInput;
  try {
    originalInput = await qa.inputPrompt("Enter meeting/training title:");
  } catch (e) {
    abort("Input canceled");
    return;
  }

  if (!originalInput?.trim()) {
    abort("No input entered");
    return;
  }

  const originalTitle = originalInput.trim();

  // Normalize the input
  let normalizedTitle;
  try {
    normalizedTitle = normalizeText(originalTitle); // Store the normalized value
  } catch (error) {
    abort(`Error processing title: ${error.message}`);
    return;
  }

  if (!normalizedTitle) {
    abort("Could not normalize the title");
    return;
  }

  // Slugify the normalized title
  let slugifiedTitle;
  try {
    slugifiedTitle = slugifyText(normalizedTitle); // Slugify the normalized text
  } catch (error) {
    abort(`Error processing slug: ${error.message}`);
    return;
  }

  if (!slugifiedTitle) {
    abort("Could not generate valid slug");
    return;
  }

  // Set both original and slugified variables
  variables.originalTitle = originalTitle;
  variables.slugifiedTitle = slugifiedTitle;
  variables.fileName = slugifiedTitle;
  variables.normalizedTitle = toDisplayName(slugifiedTitle);

  // Store the normalized text in the variables for future use
  variables.normalizedText = normalizedTitle;

  // Show success notification with both values
  new Notice(`Original: "${originalTitle}" → Slug: "${slugifiedTitle}"`);
  return slugifiedTitle;
};

// Step 1: Normalize the text (lowercase, remove diacritics, remove illegal characters)
function normalizeText(text) {
  return text
    .toString()
    .toLowerCase() // Convert to lowercase
    .normalize("NFD") // Normalize Unicode to decomposed form (NFD)
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics (accents and other marks)
    .replace(/[<>:"|?*\\/]/g, "") // Remove illegal characters for filenames
    .replace(/^\./, "") // Remove leading dot (hidden files)
    .replace(/\.$/g, "") // Remove trailing dot
    .replace(/^(con|prn|aux|nul|com[0-9]|lpt[0-9])$/i, "-$1-") // Avoid reserved names
    .replace(/[^\w\s.-]/g, ""); // Remove other special characters
}

// Step 2: Slugify the text (replace spaces, underscores, and hyphens with a single hyphen)
function slugifyText(text) {
  return text
    .replace(/[\s_-]+/g, "-") // Replace spaces, underscores, and hyphens with a single hyphen
    .replace(/^-+/, "") // Trim leading hyphens
    .replace(/-+$/, "") // Trim trailing hyphens
    .replace(/\.+/g, ".") // Consolidate multiple periods into a single period
    .substring(0, 200); // Limit length to 200 characters (55 characters shorter of the common file system limit)
}

// Function to convert slugified text to human-readable display name (Capitalized words)
function toDisplayName(slug) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1)) // Capitalize each word
    .join(" "); // Join the parts with a space
}
