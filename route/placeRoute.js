const express=require("express")
const {check}=require('express-validator')
const router=express.Router();
const placeContrioller=require('../controller/place-controller')
const fileUpload =require('../middleWare/file-upload');
const CheckAuth=require('../middleWare/check-auth');



router.get('/:pid', placeContrioller.gitPlaceById);
router.get('/user/:uid',placeContrioller.gitPlacesByUserId);
router.use(CheckAuth)
router.post(
    '/',fileUpload.single('image'),
    [
      check('title').not().isEmpty(),
      check('description').isLength({ min: 5 }),
      check('address').not().isEmpty()
    ],
    placeContrioller.createPlace
  );
  
router.patch(
  "/:pid",
  [check("title").not().isEmpty(),
  check("description").isLength({ min: 5 }),
  check('address').not().isEmpty()
],
  placeContrioller.updatePlace
);
router.delete('/:pid', placeContrioller.deletePlace);

module.exports=router
