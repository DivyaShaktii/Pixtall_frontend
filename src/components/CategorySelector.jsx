const CategorySelector = ({
  categories,
  selectedCategory,
  selectedSubcategory,
  onCategoryChange,
  onSubcategoryChange
}) => {
  const activeCategory = categories.find(item => item.value === selectedCategory);
  const subcategories = activeCategory?.subcategories ?? [];

  return (
    <>
      <div className="field stagger field-card">
        <label htmlFor="category">Product category</label>
        <p className="field-hint">Choose the product family</p>
        <select id="category" value={selectedCategory} onChange={event => onCategoryChange(event.target.value)}>
          <option value="">Select category</option>
          {categories.map(category => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      </div>

      <div className="field stagger field-card">
        <label htmlFor="subcategory">Product subcategory</label>
        <p className="field-hint">Refine the item type</p>
        <select
          id="subcategory"
          value={selectedSubcategory}
          onChange={event => onSubcategoryChange(event.target.value)}
          disabled={!selectedCategory}
        >
          <option value="">Select subcategory</option>
          {subcategories.map(subcategory => (
            <option key={subcategory.value} value={subcategory.value}>
              {subcategory.label}
            </option>
          ))}
        </select>
      </div>
    </>
  );
};

export default CategorySelector;
