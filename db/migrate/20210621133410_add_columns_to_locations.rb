class AddColumnsToLocations < ActiveRecord::Migration[6.0]
  def change
    add_column :locations, :city, :string
    add_column :locations, :size, :string
    add_column :locations, :vacant_units, :integer
    add_column :locations, :url, :string
    add_column :locations, :distance, :integer
  end
end
