import React from "react";

interface SyntaxHighlighterProps {
  code: string;
  language: string;
  className?: string;
}

export default function SyntaxHighlighter({
  code,
  language,
  className = "",
}: SyntaxHighlighterProps) {
  const highlightCode = (code: string, lang: string): string => {
    if (lang === "python") {
      return (
        code
          // Keywords
          .replace(
            /\b(def|class|if|else|elif|for|while|try|except|finally|with|as|import|from|return|yield|break|continue|pass|raise|True|False|None|and|or|not|in|is|lambda|del|global|nonlocal|assert|async|await)\b/g,
            '<span class="text-[#569cd6]">$1</span>'
          )
          // Strings
          .replace(
            /(["'`])((?:(?!\1)[^\\]|\\.)*)\1/g,
            '<span class="text-[#ce9178]">$1$2$1</span>'
          )
          // Numbers
          .replace(
            /\b(\d+(?:\.\d+)?)\b/g,
            '<span class="text-[#b5cea8]">$1</span>'
          )
          // Comments
          .replace(/(#.*$)/gm, '<span class="text-[#6a9955]">$1</span>')
          // Function calls
          .replace(
            /\b([a-zA-Z_]\w*)\s*\(/g,
            '<span class="text-[#dcdcaa]">$1</span>('
          )
          // Built-in functions
          .replace(
            /\b(print|len|str|int|float|list|dict|set|tuple|range|enumerate|zip|map|filter|sorted|reversed|abs|round|min|max|sum|any|all|open|type|isinstance|hasattr|getattr|setattr|delattr|super|property|staticmethod|classmethod)\b/g,
            '<span class="text-[#dcdcaa]">$1</span>'
          )
      );
    } else if (lang === "javascript") {
      return (
        code
          // Keywords
          .replace(
            /\b(const|let|var|function|class|if|else|for|while|try|catch|finally|switch|case|default|return|yield|break|continue|throw|new|delete|typeof|instanceof|in|of|this|super|extends|static|async|await|import|export|from|default|null|undefined|true|false|NaN|Infinity)\b/g,
            '<span class="text-[#569cd6]">$1</span>'
          )
          // Strings
          .replace(
            /(["'`])((?:(?!\1)[^\\]|\\.)*)\1/g,
            '<span class="text-[#ce9178]">$1$2$1</span>'
          )
          // Numbers
          .replace(
            /\b(\d+(?:\.\d+)?)\b/g,
            '<span class="text-[#b5cea8]">$1</span>'
          )
          // Comments
          .replace(
            /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
            '<span class="text-[#6a9955]">$1</span>'
          )
          // Function calls
          .replace(
            /\b([a-zA-Z_]\w*)\s*\(/g,
            '<span class="text-[#dcdcaa]">$1</span>('
          )
          // Built-in functions
          .replace(
            /\b(console|log|warn|error|info|debug|parseInt|parseFloat|isNaN|isFinite|encodeURI|decodeURI|encodeURIComponent|decodeURIComponent|escape|unescape|setTimeout|setInterval|clearTimeout|clearInterval|requestAnimationFrame|cancelAnimationFrame|fetch|Promise|resolve|reject|then|catch|finally|async|await|JSON|stringify|parse|Math|Object|Array|String|Number|Boolean|Date|RegExp|Error|Map|Set|WeakMap|WeakSet|Symbol|Proxy|Reflect|Intl|console|window|document|navigator|location|history|localStorage|sessionStorage)\b/g,
            '<span class="text-[#dcdcaa]">$1</span>'
          )
      );
    } else if (lang === "java") {
      return (
        code
          // Keywords
          .replace(
            /\b(public|private|protected|static|final|abstract|class|interface|extends|implements|new|this|super|import|package|return|void|int|long|float|double|boolean|char|byte|short|if|else|switch|case|default|for|while|do|break|continue|try|catch|finally|throw|throws|synchronized|volatile|transient|native|strictfp|enum|assert|const|goto|null|true|false)\b/g,
            '<span class="text-[#569cd6]">$1</span>'
          )
          // Strings
          .replace(
            /(["'`])((?:(?!\1)[^\\]|\\.)*)\1/g,
            '<span class="text-[#ce9178]">$1$2$1</span>'
          )
          // Numbers
          .replace(
            /\b(\d+(?:\.\d+)?)\b/g,
            '<span class="text-[#b5cea8]">$1</span>'
          )
          // Comments
          .replace(
            /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
            '<span class="text-[#6a9955]">$1</span>'
          )
          // Function calls
          .replace(
            /\b([a-zA-Z_]\w*)\s*\(/g,
            '<span class="text-[#dcdcaa]">$1</span>('
          )
          // Built-in classes
          .replace(
            /\b(String|Integer|Long|Float|Double|Boolean|Character|Byte|Short|System|Math|Object|Class|Exception|RuntimeException|IOException|NullPointerException|ArrayIndexOutOfBoundsException|IllegalArgumentException|IllegalStateException|UnsupportedOperationException|CloneNotSupportedException|InterruptedException|SecurityException|ClassNotFoundException|NoSuchMethodException|InstantiationException|IllegalAccessException|InvocationTargetException|NumberFormatException|IndexOutOfBoundsException|StringIndexOutOfBoundsException|ClassCastException|NegativeArraySizeException|ArrayStoreException|ArithmeticException|ConcurrentModificationException|UnsupportedOperationException|CloneNotSupportedException|InterruptedException|SecurityException|ClassNotFoundException|NoSuchMethodException|InstantiationException|IllegalAccessException|InvocationTargetException|NumberFormatException|IndexOutOfBoundsException|StringIndexOutOfBoundsException|ClassCastException|NegativeArraySizeException|ArrayStoreException|ArithmeticException|ConcurrentModificationException)\b/g,
            '<span class="text-[#4ec9b0]">$1</span>'
          )
      );
    }
    return code;
  };

  const highlightedCode = highlightCode(code, language);

  return (
    <pre className={`font-mono text-sm leading-6 ${className}`}>
      <code
        dangerouslySetInnerHTML={{ __html: highlightedCode }}
        className="block w-full h-full"
      />
    </pre>
  );
}

