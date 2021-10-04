class LocationsController < ApplicationController
  before_action :set_location, only: [:update, :show, :edit]
  
  def index
    @locations = Location.all
    @locations.each do |location|
      @marker = 
      {
        lat: location.latitude,
        lng: location.longitude,
      }
    end
  end

  def show
    @marker = 
      {
        lat: @location.latitude,
        lng: @location.longitude,
      }
  end

  def new
    @location = Location.new
  end

  def create
    @location = Location.new(strong_params)
    if @location.save
      redirect_to location_path(@location.id)
    else
      render :new
    end
  end

  def edit
  end

  def update
    @location.update(strong_params)
    redirect_to location_path(@location.id)
  end

  def destroy
    @location = Location.find(params[:id])
    @location.destroy
    
  end

  private
  def set_location
    @location = Location.find(params[:id])
  end

  def strong_params
    params.require(:location).permit(:name,:address, :postcode)
  end


end
