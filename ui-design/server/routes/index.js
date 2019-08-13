const express = require("express");
const app = express();
const apiController = require("../controllers").api;
const tripsController = require("../controllers").trips;
const settingsController = require("../controllers").settings;
const messagesController = require("../controllers").messages;
const reviewsController = require("../controllers").reviews;
const requestorController = require("../controllers").requestor;
const stripeController = require("../controllers").stripe;
const walletController = require("../controllers").wallet;
const commonController = require("../controllers").common;
const validator = require("../validators/validators");
const validate = require("../middleware/validation");
const cancelTripController = require("../controllers").cancelTrip;
const { body, query } = require("express-validator");

app.get("/", function(req, res, next) {
  res.send({ status: "ok" });
});

//Login & Register
// app.post("/UserRegister", validator("createUser"), apiController.userRegister);
app.post(
  "/UserRegister",
  //validate(validator("UserRegister")),
  apiController.userRegister
);
app.post(
  "/UserLogin",
  //validate(validator("UserLogin")),
  apiController.userLogin
);
app.get("/Logout", apiController.logout);
app.post(
  "/SocialLogin",
  //validate(validator("SocialLogin")),
  apiController.socialLogin
);
app.post(
  "/ForgotPassword",
  //validate(validator("ForgotPassword")),
  apiController.forgotPassword
);
app.get(
  "/ResetVerification",
  //validate(validator("ResetVerification")),
  apiController.resetVerification
);
app.post(
  "/ResetPassword",
  //validate(validator("ResetPassword")),
  apiController.resetPassword
);
app.post(
  "/ChangePassword",
  //validate(validator("ChangePassword")),
  apiController.changePassword
);
app.get("/GetNotificationLists", apiController.getNotificationLists);
app.post(
  "/UpdateNotification",
  //validate(validator("UpdateNotification")),
  apiController.updateNotification
);
app.get("/GetAllUsers", apiController.getAllUsers);
app.get("/GetAllUsersLanguages", apiController.getAllUsersLanguages);
app.post("/UpdateConnection", apiController.updateConnection);
app.get(
  "/GetUserById",
  //validate(validator("GetUserById")),
  apiController.getUserById
);
app.get(
  "/GetLocationLists",
  //validate(validator("GetLocationLists")),
  apiController.getLocationLists
);

app.post(
  "/sendFeedback",
  //validate(validator("sendFeedback")),
  apiController.sendFeedback
);
app.post(
  "/CreateFeedback",
  //validate(validator("CreateFeedback")),
  apiController.CreateFeedback
);

//Verfication
app.get(
  "/SendOTP",
  //validate(validator("SendOTP")),
  apiController.sendOTP
);

app.get(
  "/VerifyOTP",
  //validate(validator("VerifyOTP")),
  apiController.verifyOTP
);
app.get("/GetPhonecodelist", apiController.GetPhonecodelist);
app.get(
  "/CheckVerification",
  //validate(validator("CheckVerification")),
  apiController.checkVerification
);
app.get("/CheckFeedbackVerification", apiController.checkFeedbackVerification);
app.post("/CheckUpdateCloseTripToken", apiController.checkUpdateCloseTripToken);

//Perks
app.get("/GetAllPerks", tripsController.getAllPerks);

//Profile
app.get("/GetUserProfileData", apiController.getUserProfileData);
app.get("/GetUserAccountData", apiController.getUserAccountData);
app.post(
  "/UpdateUserProfileData",
  //validate(validator("UpdateUserProfileData")),
  apiController.updateUserProfileData
);
app.post("/updateUserBankDetails", apiController.updateUserBankDetails);

app.post("/DocumentUpload", apiController.documentUpload);
app.post("/CoverPictureUpload", apiController.coverPictureUpload);
app.post(
  "/ChangeLogo",
  //validate(validator("ChangeLogo")),
  apiController.changeLogo
);
app.post(
  "/UpdateCoverPhoto",
  //validate(validator("UpdateCoverPhoto")),
  apiController.updateCoverPhoto
);

//Requestor
app.post("/ItemImageUpload", requestorController.itemImageUpload);
app.post("/PackageImageUpload", requestorController.packageImageUpload);
app.post(
  "/SendPackageCode",
  ////validate(validator("SendPackageCode")),
  requestorController.sendPackageCode
);
app.post(
  "/VerifyPackageOTP",
  ////validate(validator("UpdateCourierRequest")),
  requestorController.verifyPackageOTP
);
app.post(
  "/CreateCourierRequest",
  ////validate(validator("UpdateCourierRequest")),
  requestorController.createCourierRequest
);
app.post(
  "/CreateAssistantRequest",
  // //validate(validator("CreateAssistantRequest")),
  requestorController.createAssistantRequest
);
app.post(
  "/CreateCompanionRequest",
  // //validate(validator("CreateCompanionRequest")),
  requestorController.createCompanionRequest
);

app.post(
  "/UpdateCourierRequest",
  ////validate(validator("UpdateCourierRequest")),
  requestorController.updateCourierRequest
);

app.post(
  "/UpdateAssistantRequest",
  //validate(validator("UpdateAssistantRequest")),
  requestorController.updateAssistantRequest
);
app.get(
  "/GetCourierReqById",
  //validate(validator("GetCourierReqById")),
  requestorController.getCourierReqById
);
app.get(
  "/GetAssistanceReqById",
  //validate(validator("GetAssistanceReqById")),
  requestorController.getAssistanceReqById
);
app.get(
  "/DeleteCourierRequest",
  //validate(validator("DeleteCourierRequest")),
  requestorController.deleteCourierRequest
);
app.get(
  "/DeleteAssistanceRequest",
  //validate(validator("DeleteAssistanceRequest")),
  requestorController.deleteAssistanceRequest
);

app.get("/GetRequests", requestorController.getRequests); /*need to hide*/
app.get(
  "/GetRequestorData",
  //validate(validator("GetRequestorData")),
  requestorController.getRequestorData
);
app.get(
  "/GetAllRequestorDataByTrip",
  //validate(validator("GetAllRequestorDataByTrip")),
  requestorController.getAllRequestorDataByTrip
);
app.get(
  "/GetAllRequestorDataById",
  //validate(validator("GetAllRequestorDataById")),
  requestorController.getAllRequestorDataById
);
app.get(
  "/ItemDeleteImage",
  //validate(validator("ItemDeleteImage")),
  requestorController.itemDeleteImage
);
app.post(
  "/ItemEditAndDeletePackageImage",
  //validate(validator("ItemEditAndDeletePackageImage")),
  requestorController.itemEditAndDeletePackageImage
);
app.post(
  "/ItemEditAndDeleteItemImage",
  //validate(validator("ItemEditAndDeleteItemImage")),
  requestorController.itemEditAndDeleteItemImage
);

//Settings
app.get("/GetUserSettingsData", settingsController.getUserSettingsData);
app.get("/GetUserSettingsOptions", settingsController.getUserSettingsOptions);
app.post(
  "/UpdateUserSettingsData",
  //validate(validator("UpdateUserSettingsData")),
  settingsController.updateUserSettingsData
);

//Favorites
app.get(
  "/AddToFavorites",
  //validate(validator("AddToFavorites")),
  tripsController.addFavorites
);

app.get("/AddToFavoriteUser", tripsController.addToFavoriteUser);
app.get("/GetFavUser", tripsController.getFavUser);
app.get("/RemoveFromFavoriteUser", tripsController.removeFromFavoriteUser);

app.get("/GetFavoritesTrips", tripsController.getFavoritesTrips);

app.get(
  "/RemoveTripFromFavorites",
  //validate(validator("RemoveTripFromFavorites")),
  tripsController.removeTripFromFavorites
);
// app.get(
//   "/RemoveUserFromFavorites",
//   //validate(validator("RemoveUserFromFavorites")),
//   tripsController.removeUserFromFavorites
// );
app.get("/GetFavoritesTripsByUser", tripsController.getFavoritesTripsByUser);

//Trips

app.post(
  "/CreateTrip",
  //validate(validator("CreateTrip")),
  tripsController.createTrip
);
app.post("/UpdateTrip", tripsController.updateTrip);
app.get(
  "/GetAllTrips",
  //validate(validator("GetAllTrips")),
  tripsController.getAllTrips
);
app.get("/GetModesOfTravels", tripsController.getModesOfTravels);
app.post("/GetAllTripsBySearch", tripsController.getAllTripsBySearch);
app.get(
  "/GetTripById",
  //validate(validator("GetTripById")),
  tripsController.getTripById
);
app.get(
  "/GetMyTrips",
  //validate(validator("GetMyTrips")),
  tripsController.getMyTrips
);
app.get(
  "/GetUserDetailsByTrips",
  //validate(validator("GetUserDetailsByTrips")),
  tripsController.getUserDetailsByTrips
);
app.get(
  "/GetUserDetailsByTripsLimit",
  //validate(validator("GetUserDetailsByTripsLimit")),
  tripsController.getUserDetailsByTripsLimit
);
app.get(
  "/GetTripStatus",
  //validate(validator("GetTripStatus")),
  tripsController.getTripStatus
);
app.get(
  "/GetServiceByTripId",
  //validate(validator("GetServiceByTripId")),
  tripsController.getServiceByTripId
);
app.get(
  "/GetTripEditById",
  //validate(validator("GetTripEditById")),
  tripsController.getTripEditById
);
app.post(
  "/UpdateServiceTrip",
  //validate(validator("UpdateServiceTrip")),
  tripsController.updateServiceTrip
);
app.get(
  "/GetTripsByServiceLogId",
  //validate(validator("GetTripsByServiceLogId")),
  tripsController.getTripsByServiceLogId
);
app.get("/GetCompletedTrips", tripsController.getCompletedTrips);
app.post("/CloseCompletedTrips", tripsController.closeCompletedTrips);

// Trip for notification
app.get(
  "/GetTripByNotification",
  //validate(validator("GetTripByNotification")),
  tripsController.getTripByNotification
);

//Trip Request
app.get(
  "/GetAllIncomingRequestByTrips",
  //validate(validator("GetAllIncomingRequestByTrips")),
  tripsController.getAllIncomingRequestByTrips
);
app.get(
  "/DeleteTrip",
  //validate(validator("DeleteTrip")),
  tripsController.deleteTrip
);
app.get(
  "/GetAllInvitesByTrips",
  //validate(validator("GetAllInvitesByTrips")),
  tripsController.getAllInvitesByTrips
);
app.get(
  "/GetAllUserInvitesCountByTrips",
  //validate(validator("GetAllUserInvitesCountByTrips")),
  tripsController.getAllUserInvitesCountByTrips
);
app.post(
  "/InvitesToTrip",
  //validate(validator("InvitesToTrip")),
  tripsController.invitesToTrip
);
app.post(
  "/InvitesUnplannedToTrip",
  //validate(validator("InvitesUnplannedToTrip")),
  tripsController.invitesUnplannedToTrip
);
app.post(
  "/UpdateTripInviteStatus",
  //validate(validator("UpdateTripInviteStatus")),
  tripsController.updateTripInviteStatus
);
app.post(
  "/UpdateUnplannedTripInviteStatus",
  //validate(validator("UpdateUnplannedTripInviteStatus")),
  tripsController.updateUnplannedTripInviteStatus
);

app.get(
  "/GetInvitesByCancelled",
  //validate(validator("UpdateUnplannedTripInviteStatus")),
  tripsController.getInvitesByCancelled
);

app.get(
  "/ViewProfileByStatus",
  //validate(validator("ViewProfileByStatus")),
  tripsController.viewProfileByStatus
);
app.post(
  "/GetIsDisConnected",
  //validate(validator("GetIsDisConnected")),
  tripsController.getIsDisConnected
);

// //Messages
app.get("/GetAllAcceptedTrips", messagesController.getAllAcceptedTrips);
app.post(
  "/SendMessage",
  //validate(validator("SendMessage")),
  messagesController.sendMessage
);
app.post(
  "/DeleteChat",
  //validate(validator("DeleteChat")),
  messagesController.deleteChat
);
app.post("/DeleteMessageChat", messagesController.deleteMessageChat);
app.get("/ListAllMessagesByUser", messagesController.listAllMessagesByUser);
app.get("/ListMessagesByChat", messagesController.listMessagesByChat);
app.get(
  "/UpdateMessageChatViewStatus",
  //validate(validator("UpdateMessageChatViewStatus")),
  messagesController.updateMessageChatViewStatus
);
app.get(
  "/GetAllMessagesByTripId",
  //validate(validator("GetAllMessagesByTripId")),
  messagesController.getAllMessagesByTripId
);
app.get(
  "/GetMessageNotificationLists",
  messagesController.getMessageNotificationLists
);
app.post(
  "/UpdateMessageNotification",
  //validate(validator("UpdateMessageNotification")),
  messagesController.updateMessageNotification
);

//Comments
app.post(
  "/PostFeedback",
  //validate(validator("PostFeedback")),
  reviewsController.postFeedback
);
app.post(
  "/PostTripComments",
  //validate(validator("PostTripComments")),
  reviewsController.postTripComments
);
app.get("/ListAllComments", reviewsController.listAllComments);
app.get("/ListAllTripComments", reviewsController.listAllTripComments);
app.post(
  "/PostReplyComments",
  //validate(validator("PostReplyComments")),
  reviewsController.postReplyComments
);
app.post(
  "/PostTripReplyComments",
  //validate(validator("PostTripReplyComments")),
  reviewsController.postTripReplyComments
);
app.get(
  "/LikeReviewComments",
  //validate(validator("LikeReviewComments")),
  reviewsController.likeReviewComments
);
// app.get(
//   "/LikeTripComments",
//   //validate(validator("LikeTripComments")),
//   reviewsController.likeTripComments
// );

app.get("/LikeTripComments", reviewsController.likeTripComments);

app.get("/GetLikedTripComments", reviewsController.getLikedTripComments);

app.get(
  "/ReplyLikeTripComments",
  //validate(validator("ReplyLikeTripComments")),
  reviewsController.replyLikeTripComments
);

app.get("/GetRatings", reviewsController.getRatings);

//Payments
app.post(
  "/CreateStripePayment",
  //validate(validator("CreateStripePayment")),
  stripeController.createStripePayment
);

app.post(
  "/CreateStripePaymentForCourier",
  ////validate(validator("CreateStripePayment")),
  stripeController.createStripePaymentForCourier
);

app.post("/KYCVerification", apiController.verificationDetails);

// wallet

app.get("/GetCurrencyList", walletController.getCurrencyList);
app.get(
  "/CheckTheBaseCurrencyEnable",
  walletController.checkTheBaseCurrencyEnable
);
app.post("/SetBaseCurrency", walletController.setBaseCurrency);
app.get(
  "/GetUserTransations",
  //validate(validator("user_transaction")),
  walletController.getUserTransations
);
app.get(
  "/GetUserWalletDetails",
  //validate(validator("user_wallet_details")),
  walletController.getUserWalletDetails
);
app.get("/SendPayoutRequest", walletController.sendPayoutRequest);

// Bank Accounts
app.get(
  "/CheckAccountNumberAlreadyExists/:account_no",
  walletController.checkAccountNumberAlreadyExists
);
app.post(
  "/CreateBankAccountDetails",
  walletController.createBankAccountDetails
);
app.put("/UpdateBankAccountDetails", walletController.updateBankAccountDetails);
app.get("/GetBankAccountDetails", walletController.getBankAccountDetails);
app.delete(
  "/DeleteBankAccountDetails/:id",
  walletController.deleteBankAccountDetails
);

// common
// app.get("/countries", commonController.getAllCountries);
// app.get("/state_of_countries/:id", commonController.getStateOfCountries);
// app.get("/cities_of_state/:id", commonController.getCitiesOfState);
app.get("/getCitiesList/:city", commonController.getCitiesList);
// app.get('/updateCitiesWithCountry', commonController.updateCitiesWithCountry)
// trip cancellation process
app.post(
  "/CreateCancellationTrip",
  cancelTripController.createCancellationTrip
);
app.get(
  "/GetCancellationMessage/:trip_id/:type",
  cancelTripController.getCancellationMessage
);

module.exports = app;
