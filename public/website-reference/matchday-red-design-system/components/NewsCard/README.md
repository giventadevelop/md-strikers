# NewsCard
The carousel card behind every news, video and club-news rail: image, category + relative time, then a headline.

- Image 16:9, square corners (`radius-none`); a video card adds a duration chip bottom-left on `black`.
- Category in `label` style, `red-text`; time in `meta`, `ink-muted` ("2 days ago").
- Headline `heading-s`, `ink`, max three lines. Voice: short and factual, "Name: quote" for interviews.
- Cards sit `space-6` apart in a horizontal rail with round Previous/Next arrows (`radius-pill`).
- Consumer provides: image, category, time, headline, link.
