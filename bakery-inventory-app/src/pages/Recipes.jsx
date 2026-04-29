import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../services/api";
import {
  Page,
  Section,
  Grid,
  Field,
  Select,
  TextInput,
  Button,
  DataTable,
  InfoBanner,
  Card,
} from "../components/UI";

export default function Recipes() {
  const [menuItems, setMenuItems] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [selectedItem, setSelectedItem] = useState("");
  const [rawMaterial, setRawMaterial] = useState("");
  const [qty, setQty] = useState("");

  async function loadData() {
    try {
      setError("");
      const items = await apiGet("/menu-items");
      const mats = await apiGet("/raw-materials");

      setMenuItems(Array.isArray(items) ? items : []);
      setMaterials(Array.isArray(mats) ? mats : []);
    } catch (err) {
      console.error("Recipes load data error:", err);
      setError(err.message || "Failed to load menu items or raw materials");
    }
  }

  async function loadRecipes(itemId) {
    if (!itemId) {
      setRecipes([]);
      return;
    }

    try {
      const data = await apiGet(`/recipes/${itemId}`);
      setRecipes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Recipes load error:", err);
      setError(err.message || "Failed to load recipe lines");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadRecipes(selectedItem);
  }, [selectedItem]);

  async function handleAdd(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      if (!selectedItem || !rawMaterial || !qty) {
        setError("Please select item, raw material, and quantity");
        return;
      }

      await apiPost("/recipes", {
        menu_item_id: Number(selectedItem),
        raw_material_id: Number(rawMaterial),
        qty_per_unit: Number(qty),
      });

      setMessage("Recipe line added successfully");
      setRawMaterial("");
      setQty("");
      loadRecipes(selectedItem);
    } catch (err) {
      console.error("Recipes add error:", err);
      setError(err.message || "Failed to save recipe line");
    }
  }

  const selectedItemName =
    menuItems.find((item) => String(item.id) === String(selectedItem))?.name || "";

  return (
    <Page
      title="Recipes"
      subtitle="Define ingredient consumption for every finished menu item"
    >
      {error && <InfoBanner text={error} tone="red" />}
      {message && <InfoBanner text={message} tone="green" />}

      <Grid min={220}>
        <Card
          title="Menu Items Loaded"
          value={menuItems.length}
          hint="Finished items available"
          tone="blue"
        />
        <Card
          title="Raw Materials Loaded"
          value={materials.length}
          hint="Ingredients available"
          tone="green"
        />
        <Card
          title="Recipe Lines"
          value={recipes.length}
          hint={selectedItemName ? `For ${selectedItemName}` : "Select an item first"}
          tone="amber"
        />
      </Grid>

      <Section title="Select Menu Item">
        <Grid min={260}>
          <Field label="Menu Item">
            <Select
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
            >
              <option value="">Select Item</option>
              {menuItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </Field>
        </Grid>
      </Section>

      {selectedItem && (
        <>
          <Section title={`Add Ingredient to ${selectedItemName || "Selected Item"}`}>
            <form onSubmit={handleAdd}>
              <Grid min={260}>
                <Field label="Raw Material">
                  <Select
                    value={rawMaterial}
                    onChange={(e) => setRawMaterial(e.target.value)}
                  >
                    <option value="">Select Material</option>
                    {materials.map((mat) => (
                      <option key={mat.id} value={mat.id}>
                        {mat.name}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Quantity Per Unit">
                  <TextInput
                    type="number"
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    placeholder="0.08"
                  />
                </Field>
              </Grid>

              <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Button type="submit">Add Recipe Line</Button>
                <Button
                  variant="light"
                  onClick={() => {
                    setRawMaterial("");
                    setQty("");
                  }}
                >
                  Clear
                </Button>
              </div>
            </form>
          </Section>

          <Section title="Recipe Register">
            <DataTable
              columns={[
                { key: "raw_material_name", label: "Raw Material" },
                { key: "qty_per_unit", label: "Qty Per Unit" },
              ]}
              rows={recipes}
              emptyText="No recipe lines added yet"
            />
          </Section>
        </>
      )}
    </Page>
  );
}