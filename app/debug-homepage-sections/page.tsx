import { getHomepageSectionsDebug } from "@/lib/actions/sections";
import {
  getHomepageProducts,
  getHomepageSectionsWithProducts,
} from "@/lib/actions/products";

export default async function DebugHomepageSectionsPage() {
  try {
    const [sectionsDebug, homepageProducts, sectionsWithProducts] =
      await Promise.all([
        getHomepageSectionsDebug(),
        getHomepageProducts({ limit: 12 }),
        getHomepageSectionsWithProducts(),
      ]);

    return (
      <div className="container mx-auto p-6 space-y-8">
        <h1 className="text-3xl font-bold">Homepage Sections Debug</h1>

        {/* Sections Overview */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Sections Overview</h2>
          <p className="text-gray-600 mb-4">
            Total active sections: {sectionsDebug.sections.length}
          </p>
          <p className="text-gray-600 mb-4">
            Total products in sections: {sectionsDebug.totalProducts}
          </p>

          {sectionsDebug.sections.length === 0 ? (
            <div className="text-red-600 bg-red-50 p-4 rounded">
              <p className="font-semibold">⚠️ No active sections found!</p>
              <p>
                You need to create and activate sections in the admin panel.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sectionsDebug.sections.map((section) => (
                <div key={section.id} className="border p-4 rounded">
                  <h3 className="font-semibold">{section.title}</h3>
                  <p className="text-sm text-gray-600">
                    Name: {section.name} | Order: {section.display_order} |
                    Products: {section.current_products_count}/
                    {section.max_products}
                  </p>
                  {section.section_products &&
                  section.section_products.length > 0 ? (
                    <div className="mt-2">
                      <p className="text-sm font-medium">
                        Products in this section:
                      </p>
                      <ul className="text-sm text-gray-600 ml-4">
                        {section.section_products
                          .sort(
                            (a: any, b: any) =>
                              a.display_order - b.display_order
                          )
                          .map((sp: any) => (
                            <li key={sp.products.id}>
                              {sp.display_order}. {sp.products.name}
                              {!sp.products.is_active && " (INACTIVE)"}
                            </li>
                          ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-sm text-orange-600 mt-2">
                      ⚠️ No products in this section
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Homepage Products */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            Homepage Products (What will be displayed)
          </h2>
          <p className="text-gray-600 mb-4">
            Products that will be shown on homepage: {homepageProducts.length}
          </p>

          {homepageProducts.length === 0 ? (
            <div className="text-red-600 bg-red-50 p-4 rounded">
              <p className="font-semibold">
                ⚠️ No products will be displayed on homepage!
              </p>
              <p>
                Make sure you have active sections with products assigned to
                them.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {homepageProducts.map((product, index) => (
                <div key={product.id} className="border p-4 rounded">
                  <h3 className="font-semibold">
                    {index + 1}. {product.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Category: {product.categories?.name || "No category"}
                  </p>
                  <p className="text-sm text-gray-600">
                    Veg: {product.is_veg ? "Yes" : "No"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sectioned Homepage Structure */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            Sectioned Homepage Structure (New)
          </h2>
          <p className="text-gray-600 mb-4">
            How products will be displayed organized by sections:{" "}
            {sectionsWithProducts.length} sections
          </p>

          {sectionsWithProducts.length === 0 ? (
            <div className="text-red-600 bg-red-50 p-4 rounded">
              <p className="font-semibold">
                ⚠️ No sections will be displayed on homepage!
              </p>
              <p>
                Make sure you have active sections with products assigned to
                them.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {sectionsWithProducts.map((section, sectionIndex) => (
                <div
                  key={section.id}
                  className="border-2 border-blue-200 p-4 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-blue-800">
                      Section {sectionIndex + 1}: {section.title}
                    </h3>
                    <span className="text-sm text-gray-600">
                      {section.products.length} products
                    </span>
                  </div>

                  {section.description && (
                    <p className="text-gray-600 mb-3">{section.description}</p>
                  )}

                  {section.products.length === 0 ? (
                    <div className="text-orange-600 bg-orange-50 p-3 rounded">
                      <p className="font-medium">
                        ⚠️ No products in this section
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {section.products.map((product, productIndex) => (
                        <div
                          key={product.id}
                          className="border p-3 rounded bg-gray-50"
                        >
                          <h4 className="font-medium text-sm">
                            {productIndex + 1}. {product.name}
                          </h4>
                          <p className="text-xs text-gray-600">
                            Category:{" "}
                            {product.categories?.name || "No category"}
                          </p>
                          <p className="text-xs text-gray-600">
                            Veg: {product.is_veg ? "Yes" : "No"}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">How to Fix Issues</h2>
          <div className="space-y-2 text-sm">
            <p>
              <strong>If no sections are found:</strong>
            </p>
            <ul className="ml-4 space-y-1">
              <li>
                1. Go to Admin → Home Customization → Product Management →
                Sections
              </li>
              <li>2. Create new sections or activate existing ones</li>
              <li>
                3. Make sure sections have <code>is_active = true</code>
              </li>
            </ul>

            <p className="mt-4">
              <strong>If sections exist but have no products:</strong>
            </p>
            <ul className="ml-4 space-y-1">
              <li>1. Go to Admin → Home Customization → Product Management</li>
              <li>2. Add products to the sections</li>
              <li>3. Make sure products are active</li>
            </ul>

            <p className="mt-4">
              <strong>If products are not showing in correct order:</strong>
            </p>
            <ul className="ml-4 space-y-1">
              <li>1. Check the display_order of sections</li>
              <li>2. Check the display_order of products within sections</li>
              <li>3. Use the arrangement page to reorder if needed</li>
            </ul>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in debug page:", error);
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-red-600">Error</h1>
        <p className="text-red-600">
          Failed to load debug information: {error.message}
        </p>
      </div>
    );
  }
}
