# CSS Flexbox Playground

Interactive playground to compose CSS flexbox container and item properties with
live preview and generated CSS.

**Live:** [css-flexbox-playground.itsjust.tools](https://css-flexbox-playground.itsjust.tools)

## Features

- Live flex container preview with configurable `flex-direction`, `flex-wrap` and `justify-content`
- Item alignment controls: `align-items` and `align-content` with visual feedback
- Per-item controls: `flex-grow`, `flex-shrink`, `flex-basis`, `align-self` and `order`
- Add, remove, duplicate, resize and relabel flex items interactively
- Gap (row and column) controls with preset and custom values
- Generated CSS output with copy button and container/item rule separation
- Serialize/deserialize the full playground setup for shareable state
- Preset layout examples: navbar, centered hero, card row, sidebar layout
- Shareable state via URL, `.itsjust.json` import/export and image/PDF export
- 100% client-side — no data ever leaves your browser

## Development

```bash
npm install
npm run build -w @itsjust/core
npm run dev
npm test
```

## Testing

```bash
npm test
```

## License

MIT
