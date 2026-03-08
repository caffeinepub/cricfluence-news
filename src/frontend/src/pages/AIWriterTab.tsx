import { useRef, useState } from "react";
import { useActor } from "../hooks/useActor";

const CATEGORIES = [
  "Technology",
  "Business",
  "Sports",
  "Finance",
  "Health",
  "Science",
  "Politics",
  "Entertainment",
  "World",
  "Startup",
];
const TONES = [
  "Journalistic",
  "Professional",
  "Casual",
  "Analytical",
  "Engaging",
];
const LENGTHS = [
  "Short (400 words)",
  "Medium (700 words)",
  "Long (1000 words)",
];

interface ArticleResult {
  title: string;
  metaDescription: string;
  category: string;
  readTime: string;
  tags: string[];
  sources: string[];
  publishDate: string;
  breaking: boolean;
  intro: string;
  sections: { heading: string; content: string }[];
  keyPoints: string[];
  conclusion: string;
}

export function AIWriterTab() {
  const { actor: backend } = useActor();

  const [topic, setTopic] = useState("");
  const [category, setCategory] = useState("Technology");
  const [tone, setTone] = useState("Journalistic");
  const [length, setLength] = useState("Medium (700 words)");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [article, setArticle] = useState<ArticleResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("preview");
  const topicRef = useRef<HTMLInputElement>(null);

  const wordTarget = length.includes("400")
    ? 400
    : length.includes("700")
      ? 700
      : 1000;

  const generate = async () => {
    if (!topic.trim()) {
      topicRef.current?.focus();
      return;
    }
    if (!backend) {
      setError("Not connected to backend. Please wait and try again.");
      return;
    }
    setLoading(true);
    setError(null);
    setArticle(null);
    setStatus("🔍 Searching the web and writing your article...");

    try {
      const raw = await backend.generateNewsArticle(
        topic.trim(),
        category,
        tone,
        BigInt(wordTarget),
      );

      setStatus("✍️ Parsing article...");
      const clean = raw
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/g, "")
        .trim();
      const start = clean.indexOf("{");
      const end = clean.lastIndexOf("}");
      if (start === -1 || end === -1)
        throw new Error("Could not parse article. Please try again.");
      const parsed = JSON.parse(clean.slice(start, end + 1)) as ArticleResult;
      setArticle(parsed);
      setStatus("");
    } catch (e) {
      setError(
        (e as Error).message || "Something went wrong. Please try again.",
      );
      setStatus("");
    } finally {
      setLoading(false);
    }
  };

  const copyContent = (type: string) => {
    if (!article) return;
    let text = "";
    if (type === "html") {
      text = `<article>\n  <h1>${article.title}</h1>\n  <p><em>${article.metaDescription}</em></p>\n  <p><strong>Key Points:</strong></p>\n  <ul>\n    ${article.keyPoints?.map((p) => `<li>${p}</li>`).join("\n    ")}\n  </ul>\n  <p>${article.intro}</p>\n  ${article.sections?.map((s) => `<h2>${s.heading}</h2>\n  <p>${s.content}</p>`).join("\n  ")}\n  <h2>Conclusion</h2>\n  <p>${article.conclusion}</p>\n  <p><strong>Tags:</strong> ${article.tags?.map((t) => `#${t}`).join(" ")}</p>\n  <p><em>Sources: ${article.sources?.join(", ")}</em></p>\n</article>`;
    } else if (type === "text") {
      text = `${article.title}\n${"─".repeat(60)}\n${article.metaDescription}\n\n${article.publishDate} | ${article.readTime}\n\nKEY POINTS:\n${article.keyPoints?.map((p) => `• ${p}`).join("\n")}\n\n${article.intro}\n\n${article.sections?.map((s) => `${s.heading.toUpperCase()}\n${s.content}`).join("\n\n")}\n\nCONCLUSION\n${article.conclusion}\n\nTags: ${article.tags?.map((t) => `#${t}`).join(" ")}\nSources: ${article.sources?.join(", ")}`;
    } else if (type === "wordpress") {
      text = `<!-- wp:heading --><h1 class="wp-block-heading">${article.title}</h1><!-- /wp:heading -->\n\n<!-- wp:paragraph --><p>${article.intro}</p><!-- /wp:paragraph -->\n\n${article.sections?.map((s) => `<!-- wp:heading {"level":2} --><h2 class="wp-block-heading">${s.heading}</h2><!-- /wp:heading -->\n\n<!-- wp:paragraph --><p>${s.content}</p><!-- /wp:paragraph -->`).join("\n\n")}\n\n<!-- wp:heading {"level":2} --><h2 class="wp-block-heading">Conclusion</h2><!-- /wp:heading -->\n\n<!-- wp:paragraph --><p>${article.conclusion}</p><!-- /wp:paragraph -->`;
    }
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const cs = {
    card: {
      background: "rgba(255,255,255,0.025)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: "18px",
      padding: "28px",
      marginBottom: "24px",
    },
    label: {
      display: "block",
      color: "#818cf8",
      fontSize: "10px",
      letterSpacing: "2px",
      textTransform: "uppercase" as const,
      marginBottom: "8px",
      fontFamily: "system-ui,sans-serif",
    },
  };

  return (
    <div
      style={{ fontFamily: "'Palatino Linotype','Book Antiqua',Georgia,serif" }}
    >
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h2
          style={{
            fontSize: "20px",
            fontWeight: "700",
            color: "#f8f6ff",
            marginBottom: "4px",
          }}
        >
          AI News Writer
        </h2>
        <p
          style={{
            color: "#6b7280",
            fontSize: "13px",
            fontFamily: "system-ui,sans-serif",
          }}
        >
          Type a topic and generate a publish-ready news article instantly.
        </p>
      </div>

      {/* Input card */}
      <div style={cs.card}>
        <div style={{ marginBottom: "20px" }}>
          <label htmlFor="cf-topic" style={cs.label}>
            News Topic *
          </label>
          <input
            id="cf-topic"
            ref={topicRef}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && generate()}
            placeholder="e.g. India AI startups 2025, Bitcoin ETF, IPL 2025, iPhone 17 launch..."
            style={{
              width: "100%",
              padding: "15px 18px",
              borderRadius: "10px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#f0eeff",
              fontSize: "15px",
              outline: "none",
              boxSizing: "border-box",
              fontFamily: "inherit",
              transition: "border-color 0.2s,box-shadow 0.2s",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#6366f1";
              e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "rgba(255,255,255,0.1)";
              e.target.style.boxShadow = "none";
            }}
            data-ocid="aiwriter.topic.input"
          />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "14px",
            marginBottom: "22px",
          }}
        >
          {(
            [
              ["Category", CATEGORIES, category, setCategory],
              ["Tone", TONES, tone, setTone],
              ["Length", LENGTHS, length, setLength],
            ] as [string, string[], string, (v: string) => void][]
          ).map(([lbl, opts, val, set]) => (
            <div key={lbl}>
              <label htmlFor={`cf-sel-${lbl}`} style={cs.label}>
                {lbl}
              </label>
              <select
                id={`cf-sel-${lbl}`}
                value={val}
                onChange={(e) => set(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#f0eeff",
                  fontSize: "13px",
                  outline: "none",
                  cursor: "pointer",
                  fontFamily: "system-ui,sans-serif",
                }}
                data-ocid={`aiwriter.${lbl.toLowerCase()}.select`}
              >
                {opts.map((o) => (
                  <option key={o} value={o} style={{ background: "#0e0b1e" }}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={generate}
          disabled={loading || !topic.trim()}
          style={{
            width: "100%",
            padding: "16px",
            borderRadius: "12px",
            border: "none",
            background:
              loading || !topic.trim()
                ? "rgba(79,70,229,0.2)"
                : "linear-gradient(135deg,#4f46e5,#0891b2)",
            color: loading || !topic.trim() ? "rgba(255,255,255,0.3)" : "white",
            fontSize: "15px",
            fontWeight: "700",
            cursor: loading || !topic.trim() ? "not-allowed" : "pointer",
            fontFamily: "system-ui,sans-serif",
            transition: "opacity 0.2s",
          }}
          data-ocid="aiwriter.generate.primary_button"
        >
          {loading ? (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
              }}
            >
              <span
                style={{
                  width: "18px",
                  height: "18px",
                  border: "2px solid rgba(255,255,255,0.2)",
                  borderTopColor: "white",
                  borderRadius: "50%",
                  display: "inline-block",
                  animation: "spin 0.7s linear infinite",
                }}
              />
              {status || "Generating article..."}
            </span>
          ) : (
            "✍️ Generate News Article"
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.25)",
            borderRadius: "12px",
            padding: "16px 20px",
            color: "#fca5a5",
            marginBottom: "24px",
            fontFamily: "system-ui,sans-serif",
            fontSize: "14px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
          data-ocid="aiwriter.error_state"
        >
          <span>⚠️ {error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            style={{
              background: "none",
              border: "none",
              color: "#fca5a5",
              cursor: "pointer",
              fontSize: "18px",
              lineHeight: "1",
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Article output */}
      {article && (
        <div
          style={{
            ...cs.card,
            padding: 0,
            overflow: "hidden",
            animation: "fadeIn 0.4s ease",
          }}
        >
          {/* Banner */}
          <div
            style={{
              background:
                "linear-gradient(135deg,rgba(79,70,229,0.15),rgba(8,145,178,0.08))",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              padding: "28px 32px",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
                marginBottom: "14px",
                alignItems: "center",
              }}
            >
              {article.breaking && (
                <span
                  style={{
                    background: "#ef4444",
                    borderRadius: "5px",
                    padding: "3px 10px",
                    fontSize: "11px",
                    fontWeight: "800",
                    color: "white",
                    letterSpacing: "1px",
                    fontFamily: "system-ui,sans-serif",
                  }}
                >
                  🔴 BREAKING
                </span>
              )}
              <span
                style={{
                  background: "rgba(99,102,241,0.2)",
                  border: "1px solid rgba(99,102,241,0.35)",
                  borderRadius: "6px",
                  padding: "3px 12px",
                  fontSize: "11px",
                  color: "#818cf8",
                  fontFamily: "system-ui,sans-serif",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                }}
              >
                {article.category}
              </span>
              <span
                style={{
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: "6px",
                  padding: "3px 10px",
                  fontSize: "11px",
                  color: "#6b7280",
                  fontFamily: "system-ui,sans-serif",
                }}
              >
                📖 {article.readTime}
              </span>
              <span
                style={{
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: "6px",
                  padding: "3px 10px",
                  fontSize: "11px",
                  color: "#6b7280",
                  fontFamily: "system-ui,sans-serif",
                }}
              >
                📅 {article.publishDate}
              </span>
              {article.sources?.length > 0 && (
                <span
                  style={{
                    background: "rgba(16,185,129,0.1)",
                    border: "1px solid rgba(16,185,129,0.2)",
                    borderRadius: "6px",
                    padding: "3px 10px",
                    fontSize: "11px",
                    color: "#34d399",
                    fontFamily: "system-ui,sans-serif",
                  }}
                >
                  ✅ {article.sources.length} source
                  {article.sources.length > 1 ? "s" : ""}
                </span>
              )}
            </div>
            <h2
              style={{
                fontSize: "clamp(18px,3vw,26px)",
                fontWeight: "700",
                margin: "0 0 10px",
                lineHeight: "1.3",
                color: "#f8f6ff",
              }}
            >
              {article.title}
            </h2>
            <p
              style={{
                margin: 0,
                color: "#5c5880",
                fontStyle: "italic",
                fontSize: "14px",
                fontFamily: "system-ui,sans-serif",
              }}
            >
              {article.metaDescription}
            </p>
          </div>

          {/* Tabs */}
          <div
            style={{
              display: "flex",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(0,0,0,0.2)",
            }}
          >
            {(
              [
                ["preview", "📄 Article"],
                ["sources", "🌐 Sources & Tags"],
              ] as [string, string][]
            ).map(([tab, lbl]) => (
              <button
                type="button"
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "13px 22px",
                  border: "none",
                  background: "none",
                  color: activeTab === tab ? "#818cf8" : "#4b5563",
                  fontSize: "13px",
                  fontFamily: "system-ui,sans-serif",
                  cursor: "pointer",
                  fontWeight: activeTab === tab ? "600" : "400",
                  borderBottom:
                    activeTab === tab
                      ? "2px solid #6366f1"
                      : "2px solid transparent",
                  transition: "all 0.2s",
                }}
                data-ocid={`aiwriter.result.${tab}.tab`}
              >
                {lbl}
              </button>
            ))}
          </div>

          {/* Body */}
          <div style={{ padding: "28px 32px" }}>
            {activeTab === "preview" && (
              <>
                {article.keyPoints?.length > 0 && (
                  <div
                    style={{
                      background: "rgba(99,102,241,0.06)",
                      border: "1px solid rgba(99,102,241,0.15)",
                      borderRadius: "12px",
                      padding: "18px 22px",
                      marginBottom: "26px",
                    }}
                  >
                    <p
                      style={{
                        margin: "0 0 12px",
                        color: "#818cf8",
                        fontSize: "10px",
                        fontFamily: "system-ui,sans-serif",
                        letterSpacing: "2px",
                        textTransform: "uppercase",
                        fontWeight: "600",
                      }}
                    >
                      Key Takeaways
                    </p>
                    <ul style={{ margin: 0, padding: "0 0 0 18px" }}>
                      {article.keyPoints.map((p) => (
                        <li
                          key={p}
                          style={{
                            color: "#c4bfe0",
                            fontSize: "14px",
                            lineHeight: "1.7",
                            marginBottom: "5px",
                            fontFamily: "system-ui,sans-serif",
                          }}
                        >
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <p
                  style={{
                    fontSize: "17px",
                    lineHeight: "1.85",
                    color: "#d4d0e8",
                    marginBottom: "28px",
                    borderLeft: "3px solid #6366f1",
                    paddingLeft: "18px",
                    fontStyle: "italic",
                  }}
                >
                  {article.intro}
                </p>
                {article.sections?.map((s) => (
                  <div key={s.heading} style={{ marginBottom: "26px" }}>
                    <h3
                      style={{
                        fontSize: "19px",
                        fontWeight: "600",
                        color: "#ede9ff",
                        margin: "0 0 12px",
                        paddingBottom: "10px",
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      {s.heading}
                    </h3>
                    <p
                      style={{
                        fontSize: "15px",
                        lineHeight: "1.85",
                        color: "#a09cbf",
                        margin: 0,
                        fontFamily: "system-ui,sans-serif",
                      }}
                    >
                      {s.content}
                    </p>
                  </div>
                ))}
                <div
                  style={{
                    background: "rgba(8,145,178,0.06)",
                    border: "1px solid rgba(8,145,178,0.15)",
                    borderRadius: "12px",
                    padding: "20px 22px",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 8px",
                      color: "#67e8f9",
                      fontSize: "10px",
                      fontFamily: "system-ui,sans-serif",
                      letterSpacing: "2px",
                      textTransform: "uppercase",
                      fontWeight: "600",
                    }}
                  >
                    Conclusion
                  </p>
                  <p
                    style={{
                      fontSize: "15px",
                      lineHeight: "1.85",
                      color: "#a09cbf",
                      margin: 0,
                      fontFamily: "system-ui,sans-serif",
                    }}
                  >
                    {article.conclusion}
                  </p>
                </div>
              </>
            )}

            {activeTab === "sources" && (
              <>
                <div style={{ marginBottom: "28px" }}>
                  <p style={cs.label}>Sources</p>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    {article.sources?.map((src) => (
                      <div
                        key={src}
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.07)",
                          borderRadius: "8px",
                          padding: "12px 16px",
                          color: "#a09cbf",
                          fontSize: "14px",
                          fontFamily: "system-ui,sans-serif",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <span style={{ color: "#34d399" }}>✓</span> {src}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p style={cs.label}>SEO Tags</p>
                  <div
                    style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
                  >
                    {article.tags?.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.09)",
                          borderRadius: "20px",
                          padding: "5px 14px",
                          fontSize: "13px",
                          color: "#6b7280",
                          fontFamily: "system-ui,sans-serif",
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Copy Bar */}
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.06)",
              padding: "18px 32px",
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              background: "rgba(0,0,0,0.15)",
              alignItems: "center",
            }}
          >
            {(
              [
                ["html", "📋 Copy HTML"],
                ["wordpress", "🔵 WordPress"],
                ["text", "📄 Plain Text"],
              ] as [string, string][]
            ).map(([k, lbl]) => (
              <button
                type="button"
                key={k}
                onClick={() => copyContent(k)}
                style={{
                  padding: "10px 18px",
                  borderRadius: "8px",
                  border: `1px solid ${copiedType === k ? "rgba(52,211,153,0.4)" : "rgba(255,255,255,0.1)"}`,
                  background:
                    copiedType === k
                      ? "rgba(52,211,153,0.1)"
                      : "rgba(255,255,255,0.04)",
                  color: copiedType === k ? "#34d399" : "#9ca3af",
                  fontSize: "13px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontFamily: "system-ui,sans-serif",
                  transition: "all 0.2s",
                }}
                data-ocid={`aiwriter.copy.${k}.button`}
              >
                {copiedType === k ? "✅ Copied!" : lbl}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setArticle(null);
                setTopic("");
              }}
              style={{
                marginLeft: "auto",
                padding: "10px 18px",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.07)",
                background: "transparent",
                color: "#4b5563",
                fontSize: "13px",
                cursor: "pointer",
                fontFamily: "system-ui,sans-serif",
              }}
              data-ocid="aiwriter.reset.button"
            >
              🔄 New Article
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!article && !loading && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))",
            gap: "14px",
          }}
        >
          {[
            {
              icon: "✍️",
              t: "AI-Powered Writing",
              d: "Powered directly — no API key needed",
            },
            {
              icon: "📰",
              t: "Full Article",
              d: "Intro, sections, conclusion, key points",
            },
            {
              icon: "🔵",
              t: "WordPress Ready",
              d: "One-click copy as WP blocks",
            },
            {
              icon: "📈",
              t: "SEO Optimized",
              d: "Title, meta description and tags for Google",
            },
          ].map(({ icon, t, d }) => (
            <div
              key={t}
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "12px",
                padding: "20px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "26px", marginBottom: "10px" }}>
                {icon}
              </div>
              <div
                style={{
                  fontWeight: "600",
                  color: "#e8e4ff",
                  marginBottom: "6px",
                  fontSize: "13px",
                  fontFamily: "system-ui,sans-serif",
                }}
              >
                {t}
              </div>
              <div
                style={{
                  color: "#4b5563",
                  fontSize: "12px",
                  lineHeight: "1.6",
                  fontFamily: "system-ui,sans-serif",
                }}
              >
                {d}
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        select option { background: #0e0b1e; color: #f0eeff; }
      `}</style>
    </div>
  );
}
