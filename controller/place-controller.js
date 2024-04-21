const { validationResult } = require("express-validator");
const fs=require('fs')
const mongoose=require('mongoose')
const HttpError = require("../modal/httpError");
const gettCoordsForAddress = require("../utils/locations");
const Place = require("../modal/place");
const User = require("../modal/users");

const gitPlaceById = async (req, res, next) => {
  const placeId = req.params.pid; // { pid: 'p1' }
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong ,couldn't find a place",
      500
    );
    return next(error);
  }
  if (!place) {
    const error = new HttpError(
      "Couldn't find a place for the previos place ID",
      404
    );
    return next(error);
  }

  res.json({ place: place.toObject({ getters: true }) }); // => { place } => { place: place }
};

const gitPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  // let places;
  let userWithPlaces;
  try {
    userWithPlaces = await User.findById(userId).populate('places')
  } catch (err) {
    const error = new HttpError(
      "Fetching place failed ,please try again later",
      500
    );
    return next(error);
  }
  // if (!places || places.length === 0)
  if (!userWithPlaces || userWithPlaces.places.length === 0) {
    return next(
      new HttpError("Couldn't find a places for the previos user ID", 404)
    );
  }
  res.json({
    places: userWithPlaces.places.map((place) => place.toObject({ getters: true })),
  });
};

const createPlace = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed ,please check your data", 422)
    );
  }
  const { title, description, address,location } = req.body;
  const createdPlace = new Place({
    title,
    description,
    location,
    image:req.file.path,
    address,
    creator:req.userData.userId,
  });
  let user;
  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    const error = new HttpError(
      "Creating place failed,,, please try again.",
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError("Couldn't find the user for provided id....", 400);
    return next(error);
  }
  try {
    // it for if we delete the user it delete the place 
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });
    user.places.push(createdPlace);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Creating place failed, please try again.',
      500
    );
    return next(error);
  }
    
  res.status(201).json({ place: createdPlace });
};
const updatePlace = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed ,please check your data", 422)
    );
  }
  const { title, description, address } = req.body;
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong ,please try again later",
      500
    );
    return next(error);
  }
  if(place.creator.toString() !== req.userData.userId){
    const error = new HttpError(
      "you are not allowed to edit in this place",
      401
    );
    return next(error);
  }
  place.title = title;
  place.description = description;
  place.address = address;

  try {
    await place.save();
  } catch (err) {
    const error = new HttpError(
      "Somthing went wrong ,couldn't updata place",
      500
    );
  }
  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
 const placeId=req.params.pid;
 let place;
 try{
  place=await Place.findByIdAndDelete(placeId).populate('creator');
 }catch(err){
  const error=new HttpError('Something went wrong, could not delete place.',500);
  return next(error);
 }
 if (!place) {
  const error = new HttpError('Could not find place for this id.', 404);
  return next(error);
}

if (place.creator.id !== req.userData.userId) {
  const error = new HttpError(
    'You are not allowed to delete this place.',
    401
  );
  return next(error);
}
const imagePath = place.image;

try {
  const sess = await mongoose.startSession();
  sess.startTransaction();
  await place.remove({ session: sess });
  place.creator.places.pull(place);
  await place.creator.save({ session: sess });
  await sess.commitTransaction();
} catch (err) {
  const error = new HttpError(
    'Something went wrong, could not delete place.',
    500
  );
  return next(error);
}
fs.unlink(imagePath, err => {
});
};
exports.gitPlaceById = gitPlaceById;
exports.gitPlacesByUserId = gitPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
