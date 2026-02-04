const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const isWatch = process.argv.includes('--watch');

async function build() {
  try {
    // Bundle the UI TypeScript
    const buildOptions = {
      entryPoints: ['src/ui/index.ts'],
      bundle: true,
      outfile: 'dist/ui.js',
      target: 'es2017',
      format: 'iife',
    };

    if (isWatch) {
      const ctx = await esbuild.context(buildOptions);
      await ctx.watch();
      console.log('Watching for changes...');
      
      // Generate initial HTML
      generateHTML();
    } else {
      await esbuild.build(buildOptions);
      generateHTML();
      console.log('Build completed successfully!');
    }
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

function generateHTML() {
  // Read the bundled JS
  const js = fs.readFileSync('dist/ui.js', 'utf8');
  
  // Read the CSS
  const css = fs.readFileSync('src/ui/styles.css', 'utf8');
  
  // Create the HTML
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Favicon Loader</title>
  <style>
${css}
  </style>
</head>
<body>
  <div id="app"></div>

  <script>
${js}
  </script>
</body>
</html>
`;
  
  // Write the HTML file
  fs.writeFileSync('ui.html', html, 'utf8');
  console.log('Generated ui.html');
}

build();
