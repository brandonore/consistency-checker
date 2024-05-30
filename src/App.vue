<template>
  <router-view />
</template>

<style lang="scss">
/* ===== Scrollbar CSS ===== */
/* Style for Firefox */

/* Style for Chrome, Edge, and Safari */
*::-webkit-scrollbar {
  width: 10px; /* Width of the vertical scrollbar */
  height: 10px; /* Height of the horizontal scrollbar */
}

*::-webkit-scrollbar-track {
  background: rgba(99, 102, 241, 0.2); /* Color of the tracking area */
}

*::-webkit-scrollbar-thumb {
  background-color: rgba(99, 102, 241, 0.8);
  border-radius: 10px; /* Adjust this value if needed */
  border: 2px solid transparent; /* Makes the ends more rounded */
  background-clip: padding-box; /* Prevents the background color from bleeding into the border area */
}

/* Optional: Add hover effects for the scrollbar thumb */
*::-webkit-scrollbar-thumb:hover {
  background-color: rgba(
    99,
    102,
    241,
    0.9
  ); /* Darken the color a bit when hovering */
}
</style>
