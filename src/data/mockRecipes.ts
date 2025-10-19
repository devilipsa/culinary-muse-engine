export const mockRecipes = [
  {
    title: "Pan-Seared Jackfruit \"Carnitas\"",
    description: "Tender, savory jackfruit pieces are pan-seared to develop a caramelized crust, offering a plant-based twist on traditional carnitas.",
    time: "22 min",
    servings: 2,
    calories: "~150",
    image: "https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=800&q=80",
    ingredients: [
      {
        category: "primary",
        items: ["1 can (20 oz) young green jackfruit (canned in brine/water)"]
      },
      {
        category: "fat",
        items: ["1 tbsp olive oil"]
      },
      {
        category: "seasoning",
        items: ["0.5 tsp salt", "0.25 tsp black pepper"]
      }
    ],
    shoppingList: ["corn tortillas", "lime", "cilantro", "salsa"],
    equipment: ["can opener", "colander", "large skillet", "spatula"],
    instructions: [
      {
        step: 1,
        title: "Drain the canned jackfruit in a colander and rinse thoroughly under cold water to remove excess brine.",
        description: "Rinsing removes the briny taste and makes the jackfruit ready for seasoning.",
        time: "2 min"
      },
      {
        step: 2,
        title: "Using your hands or two forks, shred the jackfruit into smaller, stringy pieces, discarding any hard core pieces if present.",
        description: "Shredding creates a texture similar to pulled pork, ideal for 'carnitas'.",
        time: "3 min"
      },
      {
        step: 3,
        title: "Heat the olive oil in a large skillet over medium-high heat.",
        description: "Preheating the oil ensures the jackfruit sears evenly and doesn't stick.",
        time: "1 min"
      },
      {
        step: 4,
        title: "Add the shredded jackfruit to the hot skillet in a single layer. Season with salt and pepper.",
        description: "A single layer allows maximum contact with the pan, promoting browning. Seasoning early infuses flavor.",
        time: "0.5 min"
      },
      {
        step: 5,
        title: "Cook the jackfruit, stirring occasionally, for 10-15 minutes, until it starts to brown and crispen in places.",
        description: "Browning develops a rich flavor and desirable texture, mimicking seared meat.",
        time: "12 min"
      },
      {
        step: 6,
        title: "Serve immediately. Great in tacos, burritos, or over rice.",
        description: "Best enjoyed fresh for optimal texture and flavor.",
        time: "0.5 min"
      }
    ],
    variations: [
      "Add a pinch of smoked paprika or cumin for a more authentic 'carnitas' flavor.",
      "For a sweeter profile, add a tablespoon of BBQ sauce during the last few minutes of cooking.",
      "Instead of olive oil, use coconut oil for a slightly different flavor."
    ],
    notes: [
      "Ensure you use young green jackfruit in brine or water, not ripe jackfruit in syrup, as the flavors are very different.",
      "Pressing the drained jackfruit thoroughly can help it crisp up better in the pan."
    ],
    nutrition: "~150 kcal, P: ~2g, C: ~25g, F: ~6g"
  },
  {
    title: "Crispy Tofu Stir-Fry",
    description: "Golden-brown crispy tofu cubes tossed with fresh vegetables in a savory sauce.",
    time: "25 min",
    servings: 3,
    calories: "~220",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80",
    ingredients: [
      {
        category: "protein",
        items: ["14 oz firm tofu, pressed and cubed"]
      },
      {
        category: "vegetables",
        items: ["1 bell pepper, sliced", "1 cup broccoli florets", "2 cloves garlic, minced"]
      },
      {
        category: "sauce",
        items: ["2 tbsp soy sauce", "1 tbsp sesame oil", "1 tsp ginger, grated"]
      }
    ],
    shoppingList: ["rice", "green onions", "sesame seeds"],
    equipment: ["wok or large pan", "knife", "cutting board", "spatula"],
    instructions: [
      {
        step: 1,
        title: "Press tofu for 15 minutes to remove excess moisture, then cut into 1-inch cubes.",
        description: "Removing moisture helps achieve maximum crispiness.",
        time: "15 min"
      },
      {
        step: 2,
        title: "Heat sesame oil in a wok over high heat until shimmering.",
        description: "High heat is essential for proper stir-frying and crispy tofu.",
        time: "2 min"
      },
      {
        step: 3,
        title: "Add tofu cubes and cook undisturbed for 3 minutes until golden on one side.",
        description: "Don't move the tofu too soon to achieve a crispy crust.",
        time: "3 min"
      },
      {
        step: 4,
        title: "Flip tofu and add vegetables. Stir-fry for 4-5 minutes until vegetables are tender-crisp.",
        description: "Quick cooking preserves vegetable texture and nutrients.",
        time: "5 min"
      },
      {
        step: 5,
        title: "Add soy sauce, garlic, and ginger. Toss everything together for 1 minute.",
        description: "Final toss coats everything evenly with the aromatic sauce.",
        time: "1 min"
      }
    ],
    variations: [
      "Add chili flakes for a spicy kick",
      "Substitute tamari for soy sauce to make it gluten-free",
      "Add cashews or peanuts for extra crunch"
    ],
    notes: [
      "Press tofu thoroughly for best texture",
      "Don't overcrowd the pan - cook in batches if needed"
    ],
    nutrition: "~220 kcal, P: ~15g, C: ~12g, F: ~14g"
  }
];
