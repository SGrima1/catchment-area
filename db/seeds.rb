# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

require 'csv'
Location.delete_all

csv_text = File.read(Rails.root.join('lib', 'seeds', 'shopping_centres_analysis.csv'))
csv = CSV.parse(csv_text, headers: true, :encoding => 'ISO-8859-1')
csv.each do |row|
  l = Location.new
  l.name = row['Name']
  l.address = row['Location']
  l.city = row['City']
  l.size = row['Size']
  l.vacant_units = row['Vacant Units']
  l.url = row['URL']
  l.distance = row['Distance']
  l.save
  puts "#{row},
         #{l.name} | #{l.address} | #{l.city} | #{l.size} | #{l.vacant_units} | #{l.url} | #{l.distance} "
end

puts "There are now #{Location.count} rows in the transactions table"