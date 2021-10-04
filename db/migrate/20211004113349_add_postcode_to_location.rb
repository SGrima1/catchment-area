class AddPostcodeToLocation < ActiveRecord::Migration[6.0]
  def change
    add_column :locations, :postcode, :string
  end
end
