// Custom markdownlint rules
// See https://github.com/DavidAnson/markdownlint/blob/main/doc/CustomRules.md
//
// This file defines custom rules for markdownlint to enforce project-specific conventions
// that are not covered by the standard markdownlint rules.

module.exports = [
  {
    names: ["no-link-attributes"],
    description: "Disallow link attributes like {:target=\"_blank\"}",
    tags: ["links"],
    function: function rule(params, onError) {
      // Pattern to match link attributes like {:target="_blank"} after links
      // These Kramdown-style attributes are not supported by the current documentation system
      // Matches inline links: ](url){:...} or ](url) {:...}
      // Reference-style links: ][ref]{:...} or ][]{:...}
      // Shorthand reference links: ]{:...}
      const linkAttributePattern = /\](?:\([^\)]+\)|\[[^\]]*\])?\s*\{:[^}]+\}/g;
      
      params.tokens.forEach(function forToken(token) {
        if (token.type === "inline") {
          const lineNumber = token.lineNumber;
          const line = token.line;
          
          // Reset lastIndex to 0 before each token to avoid stateful regex issues
          linkAttributePattern.lastIndex = 0;
          
          let match;
          while ((match = linkAttributePattern.exec(line)) !== null) {
            const matchText = match[0];
            const column = match.index + 1;
            
            onError({
              lineNumber: lineNumber,
              detail: "Link attributes like '{:target=\"_blank\"}' are not allowed",
              context: matchText,
              range: [column, matchText.length]
            });
          }
        }
      });
    }
  }
];

