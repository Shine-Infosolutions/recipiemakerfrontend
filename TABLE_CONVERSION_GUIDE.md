# Convert to DaisyUI Table View

## Table Structure Template

Replace the card/list view with this DaisyUI table structure:

```jsx
<div className="overflow-x-auto">
  <table className="table table-zebra">
    <thead>
      <tr>
        <th>Column 1</th>
        <th>Column 2</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {items.map((item) => (
        <tr key={item._id} className="hover">
          <td>{item.name}</td>
          <td>{item.value}</td>
          <td>
            <button className="btn btn-sm btn-primary">Action</button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

## 1. Finished Goods (Cooking.jsx)
Columns: Recipe Name | Quantity | Ingredients | Status | Date | Actions

## 2. Semi-Finished (SemiFinished.jsx)
Columns: Recipe Name | Ingredients | Restocked Items | Date | Actions

## 3. Raw Materials (RawMaterials.jsx)
Columns: Recipe Name | Variation | Ingredients | Actions

## 4. Inventory (Inventory.jsx)
Columns: Name | Category | Quantity | Unit | Price | Actions

Use DaisyUI classes:
- `table` - base table
- `table-zebra` - striped rows
- `table-pin-rows` - sticky header
- `btn btn-sm` - small buttons
- `badge` - for status/tags
