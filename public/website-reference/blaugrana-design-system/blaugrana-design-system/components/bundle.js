/* @ds-bundle: {"format":4,"namespace":"Blaugrana","components":[{"name":"Button"},{"name":"Tag"},{"name":"SectionHeader"},{"name":"MatchCard"},{"name":"NewsCard"}]} */
(function () {
  var h = window.React.createElement;
  function cx() { return Array.prototype.filter.call(arguments, Boolean).join(" "); }
  function omit(o, keys) { var r = {}; for (var k in o) if (keys.indexOf(k) < 0) r[k] = o[k]; return r; }

  function Button(p) {
    var variant = p.variant || "primary", size = p.size || "m";
    var rest = omit(p, ["variant", "size", "className", "children", "href"]);
    var cls = cx("bg-btn", "bg-btn-" + variant, size !== "m" && "bg-btn-" + size, p.className);
    if (p.href) return h("a", Object.assign({ href: p.href, className: cls }, rest), p.children);
    return h("button", Object.assign({ type: "button", className: cls }, rest), p.children);
  }

  function Tag(p) {
    return h("span", { className: cx("bg-tag", "bg-tag-" + (p.tone || "neutral"), p.className) }, p.children);
  }

  function SectionHeader(p) {
    return h("div", { className: cx("bg-sh", p.className) },
      h("div", null,
        p.kicker ? h("span", { className: "bg-sh-kicker" }, p.kicker) : null,
        h("h2", { className: "bg-sh-title" }, p.title)),
      p.linkLabel ? h("a", { className: "bg-sh-link", href: p.href || "#" }, p.linkLabel + " →") : null);
  }

  function Crest(t, away) {
    return h("div", { className: "bg-team" },
      t.crestSrc ? h("img", { src: t.crestSrc, alt: "", width: 48, height: 48 })
                 : h("span", { className: cx("bg-crest", away && "bg-crest-away"), "aria-hidden": "true" }, t.short || (t.name || "").slice(0, 3).toUpperCase()),
      h("span", null, t.name));
  }

  function MatchCard(p) {
    var status = p.status || "upcoming";
    var centre = status === "upcoming"
      ? h("div", { className: "bg-kick" }, h("span", { className: "bg-kick-time" }, p.time), h("span", { className: "bg-kick-date" }, p.date))
      : h("div", { className: "bg-kick" }, h("span", { className: "bg-score" }, p.homeScore + " – " + p.awayScore),
          h("span", { className: "bg-kick-date" }, status === "live" ? (p.minute || "") : "Full time"));
    var badge = status === "live" ? h(Tag, { tone: "live" }, "Live")
      : status === "final" ? h(Tag, { tone: "neutral" }, "FT") : h(Tag, { tone: "gold" }, p.date ? "Next" : "Soon");
    return h("article", { className: cx("bg-match", p.className) },
      h("div", { className: "bg-match-top" }, h("span", { className: "bg-match-comp" }, p.competition), badge),
      h("div", { className: "bg-match-body" }, Crest(p.home || {}), centre, Crest(p.away || {}, true)),
      h("div", { className: "bg-match-foot" },
        h("span", { className: "bg-venue" }, p.venue),
        p.ctaLabel ? h(Button, { size: "s", variant: status === "upcoming" ? "primary" : "tertiary", href: p.ctaHref }, p.ctaLabel) : null));
  }

  function NewsCard(p) {
    return h("a", { className: cx("bg-news", p.className), href: p.href || "#" },
      h("div", { className: "bg-news-media" }, p.imageSrc ? h("img", { src: p.imageSrc, alt: p.imageAlt || "" }) : h("div", { className: "bg-news-stripes", "aria-hidden": "true" })),
      h("div", { className: "bg-news-body" },
        h("span", { className: "bg-news-bar", "aria-hidden": "true" }),
        p.category ? h("span", null, h(Tag, { tone: p.categoryTone || "neutral" }, p.category)) : null,
        h("h3", { className: "bg-news-title" }, p.title),
        p.meta ? h("span", { className: "bg-news-meta" }, p.meta) : null));
  }

  window.Blaugrana = Object.assign(window.Blaugrana || {}, { Button: Button, Tag: Tag, SectionHeader: SectionHeader, MatchCard: MatchCard, NewsCard: NewsCard });
})();
