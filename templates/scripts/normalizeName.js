module.exports = async (params) => {
  const { quickAddApi: qa, variables, abort } = params;

  // Prompt user
  let input;
  try {
    input = await qa.inputPrompt(
      "Enter name (supports: Smith, John / John Smith / Alice):"
    );
  } catch (e) {
    abort("Name input canceled");
    return;
  }

  if (!input) {
    abort("No name entered");
    return;
  }

  let name = input.trim();
  if (!name) {
    abort("Empty name after trim");
    return;
  }

  // Normalize unicode accents
  name = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  let first = "";
  let last = "";

  // Detect format
  if (name.includes(",")) {
    // Format: LastName, FirstName
    [last, first] = name.split(",").map((s) => s.trim());
  } else if (name.includes(" ")) {
    // Format: FirstName LastName (handles middle names)
    const parts = name.split(/\s+/);
    first = parts.shift();
    last = parts.join(" ");
  } else {
    // Single name
    first = name;
    last = "";
  }

  // Helper to normalize slug
  const makeSlug = (str) => {
    if (!str) return "";
    return str
      .toLowerCase()
      .replace(/['’]/g, "") // Remove apostrophes
      .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with hyphen
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
  };

  // Build variables
  const sirName = last ? `${last}, ${first}` : first;
  const sirNameSlug = last
    ? `${makeSlug(last)}-${makeSlug(first)}`
    : makeSlug(first);

  const personalName = last ? `${first} ${last}` : first;
  const personalNameSlug = last
    ? `${makeSlug(first)}-${makeSlug(last)}`
    : makeSlug(first);

  // Store in QuickAdd variables
  variables.sirName = sirName;
  variables.sirNameSlug = sirNameSlug;
  variables.personalName = personalName;
  variables.personalNameSlug = personalNameSlug;

  new Notice(
    `Variables set:\n\nsirName: ${sirName}\nsirNameSlug: ${sirNameSlug}\npersonalName: ${personalName}\npersonalNameSlug: ${personalNameSlug}`
  );

  return { sirName, sirNameSlug, personalName, personalNameSlug };
};
a