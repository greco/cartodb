class Map < Sequel::Model
  many_to_many :layers, :order => :order
  one_to_many :table

  plugin :association_dependencies, :layers => :nullify
  self.raise_on_save_failure = false

  PUBLIC_ATTRIBUTES = %W{ id user_id provider bounding_box_sw bounding_box_ne center zoom view_bounds_sw view_bounds_ne }

  DEFAULT_OPTIONS = {
    zoom:            3,
    bounding_box_sw: [0, 0],
    bounding_box_ne: [0, 0],
    provider:        'leaflet',
    center:          [0, 0]
  }

  # TODO remove this
  # We'll need to join maps and tables for this version
  # but they are meant to be totally independent entities
  # in the future
  attr_accessor :table_id
  def after_save
    Table.filter(user_id: self.user_id, id: self.table_id).
      update(map_id: self.id)
  end
  
  def public_values
    Hash[PUBLIC_ATTRIBUTES.map{ |a| [a, self.send(a)] }]
  end

  def validate
    super

    errors.add(:user_id, "can't be blank") if user_id.blank?
    #errors.add(:user_id, "does not exist") if user_id.present? && User[user_id].nil?
    #errors.add(:table_id, "table #{table_id} doesn't belong to user #{user_id}") if user_id.present? && !User[user_id].tables.select(:id).map(&:id).include?(table_id)
  end
end