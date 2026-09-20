/** Metro resolves font files to an asset id; TypeScript needs telling. */
declare module '*.ttf' {
  const asset: number;
  export default asset;
}
