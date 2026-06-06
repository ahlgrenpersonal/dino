# Dino

A tiny no-build PWA test game for proving the GitHub Pages to iPhone install flow before building the real game.

## Local Test

Run a local server from this folder:

```powershell
python -m http.server 4173
```

Then open:

```text
http://localhost:4173
```

## GitHub Pages Test

1. Create a new public GitHub repository, for example `dino`.
2. Push this folder to the repository.
3. In GitHub, open **Settings > Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch and `/ (root)`, then save.
6. Open the GitHub Pages URL on the iPhone in Safari.
7. Tap **Share > Add to Home Screen**.

The app is designed to work from a GitHub Pages subfolder URL such as:

```text
https://YOUR-GITHUB-USERNAME.github.io/dino/
```
