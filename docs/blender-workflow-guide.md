# Beginner's Guide to Enhancing the Penthouse Experience with Blender

This guide is designed to help you, as a beginner, take your 3D experience to the next level using Blender. We will cover adding a realistic skybox, creating invisible walls (colliders) to keep the player inside, and baking lighting for high-quality visuals on the web.

---

## 🔒 1. Download & Installation

First, you need the tools and assets.

*   **Blender**: Download the latest version from [blender.org](https://www.blender.org/download/). It's free and open source.
*   **Assets (Models & HDRIs)**:
    *   **Poly Haven** ([polyhaven.com](https://polyhaven.com/)): The best source for free, high-quality HDRIs (skyboxes) and textures.
    *   **Sketchfab** ([sketchfab.com](https://sketchfab.com/)): Great for finding 3D models (props, furniture). Look for "CC0" or free downloadable models.

---

## 🌍 2. Adding a Skybox (HDRI) & Environment

An HDRI (High Dynamic Range Image) acts as both your background sky and your lighting source.

1.  **Download an HDRI**: Go to Poly Haven and download an HDRI that matches the mood you want (e.g., "City Night", "Sunny Afternoon"). Download the **4k EXR or HDR** version.
2.  **Open Blender**: Open your Penthouse project file.
3.  **World Properties**:
    *   In the Properties panel on the right (red globe icon 🌍), find the "Surface" section.
    *   Click the yellow dot next to "Color" and select **Environment Texture**.
    *   Click "Open" and select your downloaded HDRI file.
4.  **View the Result**:
    *   Switch the viewport shading to **Rendered** (top right corner of the 3D view, the sphere icon on the far right). You should now see your customized sky and lighting!

---

## 🧱 3. Adding Colliders (Invisible Walls)

To prevent the player from walking through walls or falling off the edge, we need "Colliders". These are simple shapes that the game engine detects, but the player doesn't see.

1.  **Create a Cube**:
    *   Press `Shift + A` -> `Mesh` -> `Cube`.
2.  **Resize & Position**:
    *   Press `S` to scale, `G` to move, and `R` to rotate.
    *   Shape the cube so it covers a wall or blocks a doorway. make sure it is roughly the thickness of the wall.
3.  **Naming Convention (Important!)**:
    *   In the **Outliner** (top right list of objects), rename your cube to something like `Collider_Wall_01`.
    *   Consistent naming helps you identify them later in your code.
4.  **Repeat**: Do this for all walls, floors, and obstacles.
5.  **Visibility**: In Blender, keep them visible. In your code (React Three Fiber), you will set their material to `transparent` and `opacity={0}` or `visible={false}` so they act as invisible barriers.

---

## 💡 4. Lighting & Baking (The "Pro" Look)

Real-time lighting is expensive for web browsers. "Baking" captures the beautiful lighting shadows and reflections into a static texture image, allowing it to run smoothly on any device.

### Step A: UV Unwrapping (Preparing the Canvas)
Think of this as peeling the skin off your model so you can paint on it flat.
1.  Select your Penthouse model (the walls/floor).
2.  Go to the **UV Editing** tab (top menu).
3.  Press `A` to select all faces.
4.  Press `U` -> **Smart UV Project**.
5.  Click OK. You should see the mesh flattened out on the left screen.

### Step B: Setting up the Bake
1.  **Render Engine**: Go to the **Render Properties** (camera icon 📷). Change "Render Engine" to **Cycles**. (Baking only works in Cycles).
2.  **Create a Texture**:
    *   Go to the **Shading** tab.
    *   Add a standard material to your object if it doesn't have one.
    *   Press `Shift + A` -> `Texture` -> `Image Texture`.
    *   Click **New**, name it `Penthouse_Baked_Light`, set Resolution to `4096 x 4096` (4k), and uncheck "Alpha". Click OK.
    *   **Keep this Image Texture node selected (highlighted orange)** but DO NOT connect it to anything yet. This tells Blender "Bake to *this* image".
3.  **Bake Settings**:
    *   In **Render Properties**, scroll down to find **Bake**.
    *   **Bake Type**: Choose **Combined** (captures color, shadows, and light) OR **Diffuse** (if you just want lighting/color without glossy reflections).
    *   Check **Denoise** if available to make it smoother.
4.  **Bake It!**:
    *   Click the large **Bake** button at the top of the panel.
    *   This will take some time. The texture on the left will fill up.
5.  **Save the Image**:
    *   Once done, in the Image Editor window (left side), click **Image** -> **Save As**. Save it as `Penthouse_Baked_Light.jpg` or `.png`.

### Step C: Applying the Bake
1.  Connect the `Image Texture` node (Color) to the `Base Color` of your Principled BSDF shader.
2.  Now, the lighting is permanently painted onto your model!

---

## 📦 5. Exporting for Web

1.  Select your entire scene (Model + Colliders).
2.  Go to **File** -> **Export** -> **glTF 2.0 (.glb/.gltf)**.
3.  **Settings**:
    *   **Include**: Check **Selected Objects**.
    *   **Transform**: Check **Y Up**.
    *   **Mesh**: Apply Modifiers (usually good).
4.  Click **Export glTF 2.0**.

---

## 🚀 6. Integration Tip

In your project (`src/components/Penthouse.tsx`):
1.  Load the GLB model.
2.  Traverse the model.
3.  If an object name contains "Collider", set its `visible` prop to `false` (or use a physics library rigid body).
4.  The baked texture is already part of the model's material, so it will look great instantly!

```javascript
/* Example Pseudo-code for Reference */
nodes.forEach(node => {
  if (node.name.includes("Collider")) {
    node.visible = false; // Invisible barrier
  }
});
```

Happy Creating!
