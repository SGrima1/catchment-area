class Location < ApplicationRecord
  geocoded_by :address
  after_validation :geocode

  def postcode
    address.partition('|').last
  end 
end
