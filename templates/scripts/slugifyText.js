module.exports = async (params) => {
  const { quickAddApi: qa, variables, abort } = params;

  // Prompt user
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

  // Normalize and slugify the input
  let slugifiedTitle;
  try {
    slugifiedTitle = normalizeAndSlugify(originalTitle);
  } catch (error) {
    abort(`Error processing title: ${error.message}`);
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
  variables.camelCase = toCamelCase(originalTitle);

  // Show success notification with both values
  new Notice(`Original: "${originalTitle}" → Slug: "${slugifiedTitle}"`);
  return slugifiedTitle;
};

function normalizeAndSlugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD") // Normalize unicode
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/&/g, "-and-") // Replace ampersand
    .replace(/[<>:"|?*\\/]/g, "-") // Remove illegal file name characters
    .replace(/^\./, "") // Remove leading dot (hidden files)
    .replace(/\.$/g, "") // Remove trailing dot
    .replace(/^(con|prn|aux|nul|com[0-9]|lpt[0-9])$/i, "-$1-") // Avoid reserved names
    .replace(/[^\w\s.-]/g, "") // Remove other special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces, underscores, hyphens with single hyphen
    .replace(/^-+/, "") // Trim hyphens from start
    .replace(/-+$/, "") // Trim hyphens from end
    .replace(/\.+/g, ".") // Consolidate multiple dots
    .substring(0, 255); // Limit length for file systems
}

function toDisplayName(slug) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function toCamelCase(text) {
  return text
    .replace(/[^a-zA-Z0-9]/g, " ")
    .replace(/\s(.)/g, ($1) => $1.toUpperCase())
    .replace(/\s/g, "")
    .replace(/^(.)/, ($1) => $1.toLowerCase());
}
