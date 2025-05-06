# Troubleshooting Guide for Colors of Life App

This guide provides solutions for common issues that may occur with the Colors of Life application.

## Quick Solutions

### App Won't Start (Port Already in Use)

If you see this error:
```
Error: listen EADDRINUSE: address already in use :::3337
```

Run these commands:
```bash
# Find the process using port 3337
lsof -i :3337 | grep LISTEN

# Kill the process (replace XXXX with the PID from the command above)
kill -9 XXXX

# Then try starting the app again
npm run dev
```

### Clearing Cache and Restarting

If the app is behaving strangely or showing outdated content:

```bash
# Use our clean script to remove the .next folder
npm run clean

# Then start the development server
npm run dev

# Or do both in one command
npm run dev:clean
```

### Hidden App Reset Tool

The app includes a hidden troubleshooting tool that you can access by pressing:
**Ctrl+Shift+R**

This tool allows you to:
1. Diagnose common app issues
2. Reset the app state (clears localStorage)

### Common Next.js Issues

1. **Page Not Found or 404 Errors**
   - Check your routing in the `app` directory
   - Make sure file naming follows Next.js conventions

2. **Hydration Errors**
   - Look for components that render differently on server vs client
   - Wrap client-only components with `'use client'` directive

3. **API Issues**
   - Check your API routes in `app/api` directory
   - Verify environment variables are set correctly in `.env.local`

4. **Build Failures**
   - Delete `.next` folder: `npm run clean`
   - Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

## When to Clean/Reset

- After pulling new code from the repository
- When encountering strange UI bugs or unexpected behavior
- After upgrading Next.js or major dependencies
- When the app gets into a state where reloading doesn't help

## Contact Support

If you continue experiencing issues after trying these solutions, please contact the development team at [support@colorsoflife.com](mailto:support@colorsoflife.com). 