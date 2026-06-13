# CSI Document Reconstruction - Case Assets Folder

Put your custom case folders inside this directory. Each folder name represents a Case Code.

For example:
`/public/cases/case_0047/`

Each folder should contain:
1. `gabarito_fragmentos.json` - JSON containing the case metadata and the coordinates / boundary polygons of the fragments (matching the JSON structure of `EvidenceCase`).
2. `documento_original.png` - PNG image of the fully reconstructed original document (size 720x840 px recommended).
3. (Optional) `fragment_01.png` to `fragment_12.png` - Individual fragment images if you set `"usePreCutFragments": true` in `gabarito_fragmentos.json`.
