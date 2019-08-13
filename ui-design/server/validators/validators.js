const { body, query } = require("express-validator");

module.exports = method => {
  switch (method) {
    case "UserRegister":
      return [
        body("name")
          .exists()
          .withMessage("name doesn't exists")
          .isLength({ min: 4 })
          .withMessage("name must have atleast 4 characters"),
        body("email")
          .exists()
          .withMessage("email doesn't exists")
          .isEmail()
          .withMessage("invalid email address"),
        body("password")
          .exists()
          .withMessage("password doesn't exists")
          .isLength({ min: 6 })
          .withMessage("password must have atleast 6 characters")
      ];
    case "UserLogin":
      return [
        body("email")
          .exists()
          .withMessage("email doesn't exists")
          .isEmail()
          .withMessage("invalid email address"),
        body("password")
          .exists()
          .withMessage("password doesn't exists")
          // .isLength({ min: 6 })
          // .withMessage("password must have atleast 6 characters")
      ];
    case "SocialLogin":
      return [
        body("name")
          .exists()
          .withMessage("name doesn't exists")
          .isString()
          .withMessage("name must be a string"),
        body("email")
          .exists()
          .withMessage("email doesn't exists")
          .isEmail()
          .withMessage("invalid email address"),
        body("firstName")
          .exists()
          .withMessage("firstName doesn't exists")
          .isString()
          .withMessage("firstName must be  string"),
        body("lastName")
          .exists()
          .withMessage("lastName doesn't exists")
          .isString()
          .withMessage("lastName must be string"),
        body("provider")
          .exists()
          .withMessage("provider doesn't exists")
          .isString()
          .withMessage("provider Must Be String"),
        body("provider_id")
          .exists()
          .withMessage("provider_id  doesn't exists")
          .isString()
          .withMessage("provider_id must be String"),
        // body("profile")
        //   .exists()
        //   .withMessage("profile doesn't exists")
        //   .isString()
        //   .withMessage("profile must be string")
      ];
    case "ForgotPassword":
      return [
        body("email")
          .exists()
          .withMessage("email doesn't exists")
          .isEmail()
          .withMessage("invalid email address")
      ];
    case "ResetVerification":
      return [
        body("token")
          .exists()
          .withMessage("token doesn't exists")
          .isString()
          .withMessage("token must be string")
      ];
    case "ResetPassword":
      return [
        body("id")
          .exists()
          .withMessage("id doesn't exists")
          .isString()
          .withMessage("id must be String")
      ];
    case "ChangePassword":
      return [
        body("old_password")
          .exists()
          .withMessage("old_password doesn't exists")
          .isLength({ min: 6 })
          .withMessage("old_password must have atleast 6 characters"),
        body("password")
          .exists()
          .withMessage("password doesn't exists")
          .isLength({ min: 6 })
          .withMessage("password must have atleast 6 characters")
      ];
    case "UpdateNotification":
      return [
        body("view_status")
          .exists()
          .withMessage("view_status doesn't exists")
          .isString()
          .withMessage("view_status must be string")
      ];

    case "GetUserById":
      return [
        query("user_id")
          .exists()
          .withMessage("user_id  doesn't exists")
          .isInt()
          .withMessage("user_id must be integer")
      ];

    case "GetLocationLists":
      return [
        query("name")
          .exists()
          .withMessage("name doesn't exists")
          .isString()
          .withMessage("name must be integer")
      ];

    case "sendFeedback":
      return [
        body("id")
          .exists()
          .withMessage("id doesn't exists")
          .isInt()
          .withMessage("id must be integer")
      ];

    case "SendOTP":
      return [
        query("mobile")
          .exists()
          .withMessage("mobile doesn't exists")
          .isLength({ max: 10 })
          .withMessage("mobile must have atmost 10 characters"),
        query("token_url")
          .exists()
          .withMessage("token_url Doesn't Exists")
          .isString()
          .withMessage("token_url must be a string")
      ];

    case "VerifyOTP":
      return [
        query("otpcode")
          .exists()
          .withMessage("otpcode doesn't exists"),
        query("UVerifyOTP")
          .exists()
          .withMessage("UVerifyOTP doesn't exists"),
        query("mobile")
          .exists()
          .withMessage("mobile doesn't exists")
          .isLength({ max: 10 })
          .withMessage("mobile must have atmost 10 characters"),
        query("token_url")
          .exists()
          .withMessage("token_url doesn't exists")
          .isString()
          .withMessage("token_url must be a string")
      ];

    case "CheckVerification":
      return [
        query("token")
          .exists()
          .withMessage("token doesn't exists")
      ];

    case "UpdateUserProfileData":
      return [
        body("first_name")
          .exists()
          .withMessage("first_name doesn't exists")
          .isLength({ max: 30 })
          .withMessage("first_name must have atmost 30 characters"),
        body("last_name")
          .optional({nullable : false, checkFalsy: true})
          .exists()
          .withMessage("last_name doesn't exists")
          .isLength({ max: 30 })
          .withMessage("last_name must have atmost 30 characters"),
        body("dob")
          .optional({nullable : false, checkFalsy: true})
          .exists()
          .withMessage("dob doesn't exists")
          .isString()
          .withMessage("dob must be string"),
        body("gender")
          .optional({nullable : false, checkFalsy: true})
          .exists()
          .withMessage("gender must doesn't exists")
          .isString()
          .withMessage("gender must be string"),
        body("country")
          .optional({nullable : false, checkFalsy: true})
          .exists()
          .withMessage("country doesn't exists")
          .isString()
          .withMessage("country must be string"),
        body("state")
          .optional({nullable : false, checkFalsy: true})
          .exists()
          .withMessage("state must doesn't exists")
          .isString()
          .withMessage("state must be string"),
        body("town")
          .optional({nullable : false, checkFalsy: true})
          .exists()
          .withMessage("town must doesn't exists")
          .isString()
          .withMessage("town must be string"),
        body("email")
          .exists()
          .withMessage("email doesn't exists")
          .isEmail()
          .withMessage("invalid email address"),
        body("mobile")
          .exists()
          .withMessage("mobile must be an integer")
          .isLength({ max: 13 })
          .withMessage("mobile must have atmost 10 characters"),
        body("kyc")
          .optional({nullable : false, checkFalsy: true})
          .exists()
          .withMessage("Kyc doesn't exists")
          .isString()
          .withMessage("Kyc Must Be String"),
        body("language")
          .optional({nullable : false, checkFalsy: true})
          .exists()
          .withMessage("language doesn't exists")
          .isString()
          .withMessage("language must be string"),
        body("interest")
          .optional({nullable : false, checkFalsy: true})
          .exists()
          .withMessage("interest doesn't exists")
          .isString()
          .withMessage("interest must be string"),
        body("purposeOfTrip")
          .optional({nullable : false, checkFalsy: true})
          .exists()
          .withMessage("purposeOfTrip doesn't exists")
          .isString()
          .withMessage("purposeOfTrip must be string"),
        body("aboutMe")
          .optional({nullable : false, checkFalsy: true})
          .exists()
          .withMessage("aboutMe doesn't exists")
          .isString()
          .withMessage("aboutMe must be string"),
        body("facebookLink")
          .optional({nullable : false, checkFalsy: true})
          .exists()
          .withMessage("facebookLink doesn't exists")
          .isString()
          .withMessage("facebookLink must be string"),
        body("aboutMe")
          .optional({nullable : false, checkFalsy: true})
          .exists()
          .withMessage("aboutMe doesn't exists")
          .isString()
          .withMessage("aboutMe must be string"),
        body("twitterLink")
          .optional({nullable : false, checkFalsy: true})
          .exists()
          .withMessage("twitterLink doesn't exists")
          .isString()
          .withMessage("twitterLink must be string"),
        body("instagramLink")
          .optional({nullable : false, checkFalsy: true})
          .exists()
          .withMessage("instagramLink doesn't exists")
          .isString()
          .withMessage("instagramLink must be string")
      ];

    case "ChangeLogo":
      return [
        body("logo")
          .exists()
          .withMessage("logo doesn't exists")
          .isString()
          .withMessage("logo must be string"),
        body("oldProfilePicture")
          .optional({nullable : false, checkFalsy: true})
          .exists()
          .withMessage("oldProfilePicture doesn't exists")
          .isString()
          .withMessage("oldProfilePicture Must Be String")
      ];

    case "UpdateCoverPhoto":
      return [
        body("picture")
          .exists()
          .withMessage("picture doesn't exists")
          .isString()
          .withMessage("picture must be string"),
        body("oldCoverPicture")
          .optional({nullable : false, checkFalsy: true})
          .exists()
          .withMessage("oldCoverPicture doesn't exists")
          .isString()
          .withMessage("oldCoverPicture must be string")
      ];

    case "UpdateCourierRequest": 
    return [
      body("trip_id")
        .optional({nullable : false, checkFalsy: true})
        .exists()
        .withMessage("trip_id doesn't exists")
        .isInt()
        .withMessage("trip_id must be an integer"),
        body("from_date")
          .exists()
          .withMessage("from_date doesn't exists")
          .isString()
          .withMessage("from_date must be string"),
        body("to_date")
          .exists()
          .withMessage("to_date doesn't exists")
          .isString()
          .withMessage("to_date must be string"),
        body("package_name")
          .exists()
          .withMessage("package_name doesn't exists")
          .isString()
          .withMessage("package_name must be string"),
        body("package_description")
          .exists()
          .withMessage("package_description doesn't exists")
          .isString()
          .withMessage("package_description must be string"),
        body("package_weight")
          .exists()
          .withMessage("package_weight doesn't exists")
          .isInt()
          .withMessage("package_weight must be an integer"),
        body("weight_unit")
          .exists()
          .withMessage("weight_unit doesn't exists")
          .isString()
          .withMessage("weight_unit must be string"),
        body("size")
          .exists()
          .withMessage("size doesn't exists")
          .isString()
          .withMessage("size must be string"),
        body("item_name")
          .exists()
          .withMessage("item_name doesn't exists")
          .isString()
          .withMessage("item_name must be string"),
        body("item_weight")
          .exists()
          .withMessage("item_weight doesn't exists")
          .isString()
          .withMessage("item_weight must be string"),
        body("item_value")
          .exists()
          .withMessage("item_value doesn't exists")
          .isString()
          .withMessage("item_value must be string"),
        body("package_images")
          .exists()
          .withMessage("package_images doesn't exists")
          .isString()
          .withMessage("package_images must be string"),
        body("item_images")
          .exists()
          .withMessage("item_images doesn't exists")
          .isString()
          .withMessage("item_images must be string"),
    ];

    case "CreateAssistantRequest":
      return [
        body("from_date")
          .exists()
          .withMessage("from_date doesn't exists")
          .isString()
          .withMessage("from_date must be string"),
        body("to_date")
          .exists()
          .withMessage("to_date doesn't exists")
          .isString()
          .withMessage("to_date must be string"),
        body("members")
          .exists()
          .withMessage("members doesn't exists")
          .isInt()
          .withMessage("members must be an integer"),
        body("description")
          .exists()
          .withMessage("description doesn't exists")
          .isString()
          .withMessage("description must be string"),
        body("requested")
          .exists()
          .withMessage("requested doesn't exists")
          .isString()
          .withMessage("requested must be string"),
        // body("assigned_trip_id")
        //   .exists()
        //   .withMessage("assigned_trip_id doesn't exists")
        //   .isInt()
        //   .withMessage("assigned_trip_id must be an integer")
      ];

    case "CreateCompanionRequest":
      return [
        body("from_date")
          .exists()
          .withMessage("from_date doesn't exists")
          .isString()
          .withMessage("from_date must be string"),
        body("to_date")
          .exists()
          .withMessage("to_date doesn't exists")
          .isString()
          .withMessage("to_date must be string"),
        body("description")
          .optional({nullable : false, checkFalsy: true})
          .exists()
          .withMessage("description doesn't exists")
          .isString()
          .withMessage("description must be string"),
        body("assigned_trip_id")
          .exists()
          .withMessage("assigned_trip_id doesn't exists")
          .isInt()
          .withMessage("assigned_trip_id must be an integer")
      ];

    case "UpdateCourierRequest":
      return [
        body("from_date")
          .exists()
          .withMessage("from_date doesn't exists")
          .isString()
          .withMessage("from_date must be string"),
        body("to_date")
          .exists()
          .withMessage("to_date doesn't exists")
          .isString()
          .withMessage("to_date must be string"),
        body("package_name")
          .exists()
          .withMessage("package_name doesn't exists")
          .isString()
          .withMessage("package_name must be string"),
        body("package_description")
          .exists()
          .withMessage("package_description doesn't exists")
          .isString()
          .withMessage("package_description must be string"),
        body("package_weight")
          .exists()
          .withMessage("package_weight doesn't exists")
          .isInt()
          .withMessage("package_weight must be an integer"),
        body("weight_unit")
          .exists()
          .withMessage("weight_unit doesn't exists")
          .isString()
          .withMessage("weight_unit must be string"),
        body("size")
          .exists()
          .withMessage("size doesn't exists")
          .isString()
          .withMessage("size must be string"),
        body("item_name")
          .exists()
          .withMessage("item_name doesn't exists")
          .isString()
          .withMessage("Item_Name must be string"),
        body("item_weight")
          .exists()
          .withMessage("item_weight doesn't exists")
          .isString()
          .withMessage("item_weight must be string"),
        body("item_value")
          .exists()
          .withMessage("item_value doesn't exists")
          .isString()
          .withMessage("item_value must be string"),
        body("package_images")
          .exists()
          .withMessage("package_images doesn't exists")
          .isString()
          .withMessage("package_images must be string"),
        body("item_images")
          .exists()
          .withMessage("item_images doesn't exists")
          .isString()
          .withMessage("item_images must be string")
      ];

    case "UpdateAssistantRequest":
      return [
        body("from_date")
          .exists()
          .withMessage("from_date doesn't exists")
          .isString()
          .withMessage("from_date must be string"),
        body("to_date")
          .exists()
          .withMessage("to_date doesn't exists")
          .isString()
          .withMessage("to_date must be string"),
        body("members")
          .exists()
          .withMessage("members doesn't exists")
          .isInt()
          .withMessage("members must be an integer"),
        body("description")
          .exists()
          .withMessage("description doesn't exists")
          .isString()
          .withMessage("description must be string"),
        body("requested")
          .exists()
          .withMessage("requested doesn't exists")
          .isString()
          .withMessage("requested must be string")
      ];

    case "GetCourierReqById":
      return [
        query("reqId")
          .exists()
          .withMessage("reqId doesn't exists")
      ];

    case "GetAssistanceReqById":
      return [
        query("reqId")
          .exists()
          .withMessage("reqId doesn't exists")
      ];

    case "DeleteCourierRequest":
      return [
        query("id")
          .exists()
          .withMessage("id doesn't exists")
      ];

    case "DeleteAssistanceRequest":
      return [
        query("id")
          .exists()
          .withMessage("Id doesn't exists")
      ];

    case "GetRequestorData":
      return [
        query("trip_id")
          .optional({nullable : false, checkFalsy: true})
          .exists()
          .withMessage("trip_id doesn't exists"),
        query("user_id")
          .exists()
          .withMessage("user_id doesn't exists")
      ];

    case "GetAllRequestorDataByTrip":
      return [
        query("trip_id")
          .exists()
          .withMessage("trip_id doesn't exists")
      ];

    case "GetAllRequestorDataById":
      return [
        query("reqids")
          .exists()
          .withMessage("reqids doesn't exists")
          .isString()
          .withMessage("reqids must be a string")
      ];

    case "ItemDeleteImage":
      return [
        query("image")
          .exists()
          .withMessage("image doesn't exists")
          .isString()
          .withMessage("image must be a string")
      ];

    case "ItemEditAndDeletePackageImage":
      return [
        body("del_image")
          .exists()
          .withMessage("del_image doesn't exists")
          .isString()
          .withMessage("del_image Must Be a string")
      ];

    case "ItemEditAndDeleteItemImage":
      return [
        body("del_image")
          .exists()
          .withMessage("del_image doesn't exists")
          .isString()
          .withMessage("del_image must be a string")
      ];

    case "UpdateUserSettingsData":
      return [
        body("profile_to_everyone")
          .exists()
          .withMessage("profile_to_everyone doesn't exists")
          .isBoolean()
          .withMessage("profile_to_everyone must be Boolean"),
        body("profile_only_connected")
          .exists()
          .withMessage("profile_only_connected doesn't exists")
          .isBoolean()
          .withMessage("profile_only_connected must be a Boolean"),
        body("donot_show_profile_picture")
          .exists()
          .withMessage("donot_show_profile_picture Doesn't Exists")
          .isBoolean()
          .withMessage("donot_show_profile_picture must be a Boolean"),
        body("on_new_request")
          .exists()
          .withMessage("on_new_request doesn't exists")
          .isBoolean()
          .withMessage("on_new_request must be a Boolean"),
        body("on_new_messages")
          .exists()
          .withMessage("on_new_messages doesn't exists")
          .isBoolean()
          .withMessage("on_new_messages must be a Boolean"),
        body("on_new_comments")
          .exists()
          .withMessage("on_new_comments doesn't exists")
          .isBoolean()
          .withMessage("on_new_comments must be a Boolean")
      ];

    case "AddToFavorites":
      return [
        query("tripId")
          .exists()
          .withMessage("tripId doesn't exists")
      ];

    case "RemoveTripFromFavorites": 
    return [
      query("trip_id")
        .exists()
        .withMessage("trip_id doesn't exists")
    ];

    case "RemoveUserFromFavorites":
      return [
        query("trip_user_id")
          .exists()
          .withMessage("trip_user_id doesn't exists")
      ];

    case "CreateTrip":
      return [
        body("trip_name")
          .optional({nullable : false, checkFalsy: true})
          .exists()         
          .withMessage("trip_name doesn't exists")          
          .isString()
          .withMessage("trip_name must be a string"),
        body("mode")
          .exists()
          .withMessage("mode doesn't exists")
          .isString()
          .withMessage("mode must be a string"),
        body("departure")
          .exists()
          .withMessage("departure doesn't exists")
          .isString()
          .withMessage("departure must be a string"),
        body("destination")
          .exists()
          .withMessage("destination doesn't exists")
          .isString()
          .withMessage("destination must be a string"),
        body("trip_plan")
          .exists()
          .withMessage("trip_plan doesn't exists")
          .isString()
          .withMessage("trip_plan must be a string"),
        body("unplanned_days")
          .exists()
          .withMessage("unplanned_days doesn't exists")
          .isString()
          .withMessage("unplanned_days must be a string"),
        body("from_date")
          .exists()
          .withMessage("from_date doesn't exists")
          .isString()
          .withMessage("from_date must be a string"),
        body("to_date")
          .exists()
          .withMessage("to_date doesn't exists")
          .isString()
          .withMessage("to_date must be a string"),
        body("currency_code")
          .optional({nullable : false, checkFalsy: true})
          .exists()
          .withMessage("currency_code doesn't exists")
          .isString()
          .withMessage("currency_code must be a string"),
        body("currency_symbol")
          .optional({nullable : false, checkFalsy: true})
          .exists()
          .withMessage("currency_symbol doesn't exists")
          .isString()
          .withMessage("currency_symbol must be a string"),
        body("courier_budget")
          .optional({nullable : false, checkFalsy: true})
          .exists()
          .withMessage("courier_budget doesn't exists")
          .isString()
          .withMessage("courier_budget must be a string"),
        body("assistance_budget")
          .optional({nullable : false, checkFalsy: true})
          .exists()
          .withMessage("assistance_budget doesn't exists")
          .isString()
          .withMessage("assistance_budget must be a string"),
        body("weight_unit", "Weight_Unit Doesn't Exists")
          .optional({nullable : false, checkFalsy: true})
          .exists()
          .isString()
          .withMessage("weight_unit must be a string"),
        body("weight")
          .optional({nullable : false, checkFalsy: true})
          .exists()
          .withMessage("weight doesn't exists")
          .isString()
          .withMessage("weight must be a string"),
        body("payment_mode")
          .optional({nullable : false, checkFalsy: true})
          .exists()
          .withMessage("payment_mode doesn't exists")
          .isString()
          .withMessage("payment_mode must be a string"),
        body("description")
          .optional({nullable : false, checkFalsy: true})
          .exists()
          .withMessage("description doesn't exists")
          .isString()
          .withMessage("description must be a string"),
        body("perks")
          .optional({nullable : false, checkFalsy: true})
          .exists()
          .withMessage("perks doesn't exists")
          .isArray()
          .withMessage("perks must be a string"),
        body("is_courier")
          .exists()
          .withMessage("is_courier doesn't exists")
          .isBoolean()
          .withMessage("is_courier must be an integer"),
        body("is_assistance")
          .exists()
          .withMessage("is_assistance doesn't exists")
          .isBoolean()
          .withMessage("is_assistance must be an integer"),
        body("is_companion")
          .exists()
          .withMessage("is_companion doesn't exists")
          .isBoolean()
          .withMessage("is_companion must be an integer")
      ];

    case "GetAllTripsBySearch":
      return [
        body("departure")
          .exists()
          .withMessage("departure doesn't exists")
          .isString()
          .withMessage("departure must be a string"),
        body("destination")
          .exists()
          .withMessage("destination doesn't exists")
          .isString()
          .withMessage("destination must be a string"),
        body("type")
          .exists()
          .withMessage("type doesn't exists")
          .isString()
          .withMessage("type must be a string"),
        body("language")
          .exists()
          .withMessage("language doesn't exists")
          .isString()
          .withMessage("language must be a string"),
        body("id_verified")
          .exists()
          .withMessage("id_verified doesn't exists")
          .isInt()
          .withMessage("id_verified must be an integer"),
        body("social_verified")
          .exists()
          .withMessage("social_verified doesn't exists")
          .isInt()
          .withMessage("social_verified must be an integer")
      ];

    case "GetTripById":
      return [
        query("tripId")
          .exists()
          .withMessage("tripId doesn't exists")
          .isInt()
          .withMessage("tripId must be an integer")
      ];

    case "GetMyTrips":
      return [
        query("type")
          .exists()
          .withMessage("type doesn't exists")
          .isString()
          .withMessage("type must be a string")
      ];

    case "GetUserDetailsByTrips":
      return [
        query("user_id")
          .exists()
          .withMessage("user_id doesn't exists")
      ];

    case "GetUserDetailsByTripsLimit":
      return [
        query("user_id")
          .exists()
          .withMessage("user_id doesn't exists")
      ];

    case "GetTripStatus":
      return [
        query("tripId")
          .exists()
          .withMessage("tripId doesn't exists")
      ];

    case "GetServiceByTripId":
      return [
        query("serviceId")
          .exists()
          .withMessage("serviceId doesn't exists")
          .isInt("ServiceId Must Be an integer")
      ];

    case "GetTripEditById":
      return [
        query("tripIds")
          .exists()
          .withMessage("tripIds doesn't exists")
          .isString()
          .withMessage("tripIds must be a string")
      ];

    case "UpdateServiceTrip":
      return [
        body("trip_name")
          .optional({nullable : false, checkFalsy: true})
          .exists()
          .withMessage("trip_name doesn't exists")
          .isString()
          .withMessage("trip_name must be a string"),
        body("mode")
          .exists()
          .withMessage("mode doesn't exists")
          .isString()
          .withMessage("mode must be a string"),
        body("departure")
          .exists()
          .withMessage("departure doesn't exists")
          .isString()
          .withMessage("departure must be a string"),
        body("destination")
          .exists()
          .withMessage("destination doesn't exists")
          .isString()
          .withMessage("destination must be a string"),
        body("trip_plan")
          .exists()
          .withMessage("trip_plan doesn't exists")
          .isString()
          .withMessage("trip_plan must be a string"),
        body("unplanned_days")
          .exists()
          .withMessage("unplanned_days doesn't exists")
          .isString()
          .withMessage("unplanned_days must be a string"),
        body("from_date")
          .exists()
          .withMessage("from_date doesn't exists")
          .isString()
          .withMessage("from_date must be a string"),
        body("to_date")
          .exists()
          .withMessage("to_date doesn't exists")
          .isString()
          .withMessage("to_date must be a string"),
        body("currency_code")
          .optional({nullable : false, checkFalsy: true})
          .exists()
          .withMessage("currency_code doesn't exists")
          .isString()
          .withMessage("currency_code must be a string"),
        body("currency_symbol")
          .optional({nullable : false, checkFalsy: true})
          .exists()
          .withMessage("currency_symbol doesn't exists")
          .isString()
          .withMessage("currency_symbol must be a string"),
        body("courier_budget")
          .optional({nullable : false, checkFalsy: true})
          .exists()
          .withMessage("courier_budget doesn't exists")
          .isString()
          .withMessage("courier_budget must be a string"),
        body("assistance_budget")
          .optional({nullable : false, checkFalsy: true})
          .exists()
          .withMessage("assistance_budget doesn't exists")
          .isString()
          .withMessage("assistance_budget must be a string"),
        body("weight_unit")
          .optional({nullable : false, checkFalsy: true})
          .exists()
          .withMessage("weight_unit doesn't exists")
          .isString()
          .withMessage("weight_unit must be a string"),
        body("weight")
          .optional({nullable : false, checkFalsy: true})
          .exists()
          .withMessage("weight doesn't exists")
          .isString()
          .withMessage("weight must be a string"),
        body("payment_mode")
          .exists()
          .withMessage("payment_mode doesn't exists")
          .isString()
          .withMessage("payment_mode must be a string"),
        body("description")
          .optional({nullable : false, checkFalsy: true})
          .exists()
          .withMessage("description doesn't exists")
          .isString()
          .withMessage("description must be a string"),
        body("perks")
          .exists()
          .withMessage("perks doesn't exists")
          .isArray()
          .withMessage("perks must be a string"),
        body("is_courier")
          .exists()
          .withMessage("is_courier doesn't exists")
          .isBoolean()
          .withMessage("is_courier must be an integer"),
        body("is_assistance")
          .exists()
          .withMessage("is_assistance doesn't exists")
          .isBoolean()
          .withMessage("is_assistance must be an integer"),
        body("is_companion")
          .exists()
          .withMessage("is_companion doesn't exists")
          .isBoolean()
          .withMessage("is_companion must be an integer")
      ];

    case "GetTripsByServiceLogId":
      return [
        query("serviceLogId")
          .exists()
          .withMessage("serviceLogId doesn't exists")
      ];

    case "GetTripByNotification":
      return [
        query("notification_id")
          .exists()
          .withMessage("notification_id doesn't exists")
      ];

    case "GetAllIncomingRequestByTrips": 
      return [
      query("type")
        .exists()
        .withMessage("type doesn't exists")
      ];   

    case "DeleteTrip":
      return [
        query("tripId")
          .exists()
          .withMessage("tripId doesn't exists")
      ];

    case "GetAllInvitesByTrips":
      return [
        query("type")
          .exists()
          .withMessage("type doesn't exists")
      ];

    case "GetAllUserInvitesCountByTrips":
      return [
        query("user_id")
          .exists()
          .withMessage("user_id doesn't exists")
      ];

    case "InvitesToTrip":
      return [
        body("to_user_id")
          .exists()
          .withMessage("to_user_id doesn't exists")
          .isInt()
          .withMessage("to_user_id must be an integer"),
        body("trip_id")
          .exists()
          .withMessage("trip_id doesn't exists")
          .isInt()
          .withMessage("trip_id must be an integer"),
        body("status")
          .exists()
          .withMessage("status doesn't exists")
          .isString()
          .withMessage("status must be a string"),
        body("request_id")
          .optional({nullable : false, checkFalsy: true})
          .exists()
          .withMessage("request_id doesn't exists")
          .isInt()
          .withMessage("request_id must be an integer"),
        body("request_type")
          .exists()
          .withMessage("request_type doesn't exists")
          .isString()
          .withMessage("request_type must be a string"),
        body("message")
          .optional({nullable : false, checkFalsy: true})
          .exists()
          .withMessage("message doesn't exists")
          .isString()
          .withMessage("message must be a string"),
        body("status")
          .exists()
          .withMessage("status doesn't exists")
          .isString()
          .withMessage("status must be a string"),
        body("request_courier_weight")
          .optional({nullable : false, checkFalsy: true})
          .exists()
          .withMessage("request_courier_weight doesn't exists")
          .isInt()
          .withMessage("request_courier_weight must be a string"),
        body("request_members")
        .optional({nullable : false, checkFalsy: true})
          .exists()
          .withMessage("request_members doesn't exists")
          .isInt()
          .withMessage("request_members must be an integer")
      ];

    case "InvitesUnplannedToTrip":
      return [
        body("to_user_id")
          .exists()
          .withMessage("to_user_id doesn't exists")
          .isInt()
          .withMessage("to_user_id must be an integer"),
        body("trip_id")
          .exists()
          .withMessage("trip_id doesn't exists")
          .isInt()
          .withMessage("trip_id must be an integer"),
        body("status")
          .exists()
          .withMessage("status doesn't exists")
          .isString()
          .withMessage("status must be a string"),
        body("request_id")
          .exists()
          .withMessage("request_id doesn't exists")
          .isInt()
          .withMessage("request_id must be an integer"),
        body("request_type")
          .exists()
          .withMessage("request_type doesn't exists")
          .isString()
          .withMessage("request_type must be a string"),
        body("message")
          .optional({nullable : false, checkFalsy: true})        
          .exists()
          .withMessage("message doesn't exists")
          .isString()
          .withMessage("message must be an string"),
        body("request_courier_weight")
          .optional({nullable : false, checkFalsy: true})
          .exists()
          .withMessage("request_courier_weight doesn't exists")
          .isInt()
          .withMessage("request_courier_weight must be a integer"),
        body("request_members")
          .optional({nullable : false, checkFalsy: true})
          .exists()
          .withMessage("request_members doesn't exists")
          .isString()
          .withMessage("request_members must be a string")
      ];

    case "UpdateTripInviteStatus":
      return [
        body("user_id")
          .exists()
          .withMessage("user_id doesn't exists")
          .isInt()
          .withMessage("user_id must be an integer"),
        body("to_user_id")
          .exists()
          .withMessage("to_user_id doesn't exists")
          .isInt()
          .withMessage("to_user_id must be an integer"),
        body("from_user_id")
          .exists()
          .withMessage("from_user_id doesn't exists")
          .isInt()
          .withMessage("from_user_id must be an integer"),
        body("trip_id")
          .exists()
          .withMessage("trip_id doesn't exists")
          .isInt()
          .withMessage("trip_id must be an integer"),
        body("status")
          .exists()
          .withMessage("status doesn't exists")
          .isString()
          .withMessage("status must be a string"),
        body("request_id")
          .optional({nullable : false, checkFalsy: true})
          .exists()
          .withMessage("request_id doesn't exists")
          .isInt()
          .withMessage("request_id must be an integer"),
        body("request_type")
          .exists()
          .withMessage("request_type doesn't exists")
          .isString()
          .withMessage("request_type must be a string"),
        body("balance_weight")
          .optional({nullable : false, checkFalsy: true})
          .exists()
          .withMessage("balance_weight doesn't exists")
          .isString()
          .withMessage("balance_weight must be a string"),
        body("request_status")
          .optional({nullable : false, checkFalsy: true})
          .exists()
          .withMessage("request_status doesn't exists")
          .isString()
          .withMessage("request_status must be a string"),
        body("request_courier_weight")
          .optional({nullable : false, checkFalsy: true})
          .exists()
          .withMessage("request_courier_weight doesn't exists")
          .isString()
          .withMessage("request_courier_weight must be a string"),
        body("request_members")
          .optional({nullable : false, checkFalsy: true})
          .exists()
          .withMessage("request_members doesn't exists")
          .isString("request_members must be a string")
      ];

    case "UpdateUnplannedTripInviteStatus":
      return [
        body("user_id")
          .exists()
          .withMessage("user_id doesn't exists")
          .isInt()
          .withMessage("user_id must be an integer"),
        body("to_user_id")
          .exists()
          .withMessage("to_user_id doesn't exists")
          .isInt()
          .withMessage("to_user_id must be an integer"),
        body("from_user_id")
          .exists()
          .withMessage("from_user_id doesn't exists")
          .isInt()
          .withMessage("from_user_id must be an integer"),
        body("trip_id")
          .exists()
          .withMessage("trip_id doesn't exists")
          .isInt()
          .withMessage("trip_id must be an integer"),
        body("status")
          .exists()
          .withMessage("status doesn't exists")
          .isString()
          .withMessage("status must be a string"),
        body("request_id")
          .exists()
          .withMessage("request_id doesn't exists")
          .isInt()
          .withMessage("request_id must be an integer"),
        body("request_type")
          .exists()
          .withMessage("request_type doesn't exists")
          .isString()
          .withMessage("request_type must be a string"),
        body("balance_weight")
          .optional({nullable : false, checkFalsy: true})
          .exists()
          .withMessage("balance_weight doesn't exists")
          .isString()
          .withMessage("balance_weight must be a string"),
        body("request_courier_weight")
          .optional({nullable : false, checkFalsy: true})
          .exists()
          .withMessage("request_courier_weight doesn't exists")
          .isString()
          .withMessage("request_courier_weight must be a string"),
        body("request_members")
          .optional({nullable : false, checkFalsy: true})
          .exists()
          .withMessage("request_members doesn't exists")
          .isString()
          .withMessage("request_members doesn't exists")
      ];

    case "ViewProfileByStatus":
      return [
        query("to_user_id")
          .exists()
          .withMessage("to_user_id doesn't exists")
          .isInt()
          .withMessage("to_user_id must be an integer"),
        query("from_user_id")
          .exists()
          .withMessage("from_user_id doesn't exists")
          .isInt()
          .withMessage("from_user_id must be an integer")
      ];

    case "GetIsDisConnected":
      return [
        body("to_user_id")
          .exists()
          .withMessage("to_user_id doesn't exists")
          .isInt()
          .withMessage("to_user_id must be an integer"),
        body("from_user_id")
          .exists()
          .withMessage("from_user_id doesn't exists")
          .isInt()
          .withMessage("from_user_id must be an integer"),
        body("trip_id")
          .exists()
          .withMessage("trip_id doesn't exists")
          .isInt()
          .withMessage("trip_id must be an integer")
      ];

    case "SendMessage":
      return [
        body("to_user_id")
          .exists()
          .withMessage("to_user_id doesn't exists")
          .isInt()
          .withMessage("to_user_id Must be an integer"),
        body("from_user_id")
          .exists()
          .withMessage("from_user_id doesn't exists")
          .isInt()
          .withMessage("from_user_id must be an integer"),
        body("trip_id")
          .exists()
          .withMessage("trip_id doesn't exists")
          .isInt()
          .withMessage("trip_id must be an integer"),
        body("message")
          .exists()
          .withMessage("message doesn't exists")
          .isString()
          .withMessage("message must be a string"),
        body("from_user_name")
          .exists()
          .withMessage("user_name doesn't exists")
          .isString()
          .withMessage("user_name Must be a string")
      ];

    case "DeleteChat":
      return [
        body("to_user_id")
          .exists()
          .withMessage("to_user_id doesn't exists")
          .isInt()
          .withMessage("to_user_id must be an integer"),
        body("from_user_id")
          .exists()
          .withMessage("from_user_id doesn't exists")
          .isInt()
          .withMessage("from_user_id must be an integer"),
        body("trip_id")
          .exists()
          .withMessage("trip_id doesn't exists")
          .isInt()
          .withMessage("trip_id must be an integer")
      ];

    case "UpdateMessageChatViewStatus":
      return [
        query("to_user_id")
          .exists()
          .withMessage("to_user_id doesn't exists"),
        query("from_user_id")
          .exists()
          .withMessage("from_user_id doesn't exists"),
        query("trip_id")
          .exists()
          .withMessage("trip_id doesn't exists")
          .isInt()
          .withMessage("trip_id must be an integer")
      ];

    case "GetAllMessagesByTripId":
      return [
        query("to_user_id")
          .exists()
          .withMessage("to_user_id doesn't exists")
          .isInt()
          .withMessage("to_user_id must be an integer"),
        query("from_user_id")
          .exists()
          .withMessage("from_user_id doesn't exists")
          .isInt()
          .withMessage("from_user_id must be an integer"),
        query("trip_id")
          .exists()
          .withMessage("trip_id doesn't exists")
          .isInt()
          .withMessage("trip_id must be an integer")
      ];

    case "UpdateMessageNotification":
      return [
        body("view_status")
          .exists()
          .withMessage("view_status doesn't exists")
          .isString()
          .withMessage("view_status must be a string"),
        body("notification_ids")
          .exists()
          .withMessage("notification_ids doesn't exists")
          .isInt()
          .withMessage("notification_ids must be an integer")
      ];

    case "PostFeedback":
      return [
        body("message")
          .exists()
          .withMessage("message doesn't exists")
          .isString()
          .withMessage("message must be a string"),
        body("trip_id")
          .exists()
          .withMessage("trip_id doesn't exists")
          .isInt()
          .withMessage("trip_id Must Be an integer")
      ];

    case "PostTripComments":
      return [
        body("message")
          .exists()
          .withMessage("message doesn't exists")
          .isString()
          .withMessage("message must be a string"),
        body("trip_id")
          .exists()
          .withMessage("trip_id doesn't exists")
          .isInt("trip_id must be an integer")
      ];

    case "ListAllComments":
      return [
        query("trip_id")
          .exists()
          .withMessage("trip_id doesn't exists")
      ];

    case "PostReplyComments":
      return [
        body("message")
          .exists()
          .withMessage("message doesn't exists")
          .isString()
          .withMessage("message must be a string"),
        body("trip_id")
          .exists()
          .withMessage("trip_id doesn't exists")
          .isInt()
          .withMessage("trip_id must be an integer"),
        body("reply_msg_id")
          .exists()
          .withMessage("reply_msg_id doesn't exists")
          .isInt()
          .withMessage("reply_msg_id must be an integer")
      ];

    case "PostTripReplyComments":
      return [
        body("message")
          .exists()
          .withMessage("message doesn't exists")
          .isString()
          .withMessage("message must be a string"),
        body("trip_id")
          .exists()
          .withMessage("trip_id doesn't exists")
          .isInt()
          .withMessage("trip_id must be an integer"),
        body("reply_msg_id")
          .exists()
          .withMessage("reply_msg_id doesn't exists")
          .isInt()
          .withMessage("reply_msg_id must be an integer")
      ];

    case "LikeReviewComments":
      return [
        query("id")
          .exists()
          .withMessage("id doesn't exists"),
        query("is_like")
          .exists()
          .withMessage("is_like doesn't exists")
      ];

    case "LikeTripComments":
      return [
        query("id")
          .exists()
          .withMessage("id doesn't exists"),
        query("is_like")
          .exists()
          .withMessage("is_like doesn't exists")
      ];

    case "ReplyLikeTripComments":
      return [
        query("id")
          .exists()
          .withMessage("id doesn't exists"),
        query("is_like")
          .exists()
          .withMessage("is_like doesn't exists")
      ];

    case "CreateStripePayment":
      return [
        body("trip_id")
          .exists()
          .withMessage("trip_id doesn't exists")
          .isInt()
          .withMessage("trip_id must be an integer"),
        body("total_payment")
          .exists()
          .withMessage("total_payment doesn't exists")
          .isInt()
          .withMessage("total_payment must be an integer"),
        body("trip_user_id")
          .exists()
          .withMessage("trip_user_id doesn't exists")
          .isInt()
          .withMessage("trip_user_id must be an integer"),
        body("request_id")
          .exists()
          .withMessage("request_id doesn't exists")
          .isInt()
          .withMessage("request_id must be an integer"),
        // body("total_weight")
        //   .exists()
        //   .withMessage("total_weight doesn't exists")
        //   .isString()
        //   .withMessage("total_weight must be a string"),
        // body("from_user_id")
        //   .exists()
        //   .withMessage("from_user_id doesn't exists")
        //   .isInt()
        //   .withMessage("from_user_id must be an integer"),
        body("trip_user_id")
          .exists()
          .withMessage("trip_user_id doesn't exists")
          .isInt()
          .withMessage("trip_user_id must be an integer"),
        body("request_id")
          .exists()
          .withMessage("request_id doesn't exists")
          .isInt()
          .withMessage("request_id must be an integer"),
        body("request_type")
          .exists()
          .withMessage("request_type doesn't exists")
          .isString()
          .withMessage("request_type must be a string"),
        body("budget")
          .exists()
          .withMessage("budget doesn't exists")
          .isInt()
          .withMessage("budget must be an integer"),
        body("total_weight")
          .exists()
          .withMessage("total_weight doesn't exists")
          .isInt()
          .withMessage("total_weight must be an integer"),
        body("ternster_commission")
          .exists()
          .withMessage("ternster_commission doesn't exists")
          .isFloat()
          .withMessage("ternster_commission must be a string"),
        body("currency_code")
          .exists()
          .withMessage("currency_code doesn't exists")
          .isString()
          .withMessage("currency_code must be an integer"),
        body("currency_symbol")
          .exists()
          .withMessage("currency_symbol doesn't exists")
          .isString()
          .withMessage("currency_symbol must be an integer")
      ];

    case "user_transaction":
      return [
        query("from_date")
          .exists()
          .withMessage("from_date doesn't exists")
          .isString()
          .withMessage("from_date must be a string"),
        query("to_date")
          .exists()
          .withMessage("to_date doesn't exists")
          .isString()
          .withMessage("to_date must be a string"),
        query("status")
          .exists()
          .withMessage("status doesn't exists")
          .isString()
          .withMessage("status must be a string")
      ];

    case "user_wallet_details":
      return [
        query("from_date")
          .exists()
          .withMessage("from_date doesn't exists")
          .isString()
          .withMessage("from_date must be a string"),
        query("to_date")
          .exists()
          .withMessage("to_date doesn't exists")
          .isString()
          .withMessage("to_date must be a string"),
        query("status")
          .exists()
          .withMessage("status doesn't exists")
          .isString()
          .withMessage("status must be a string")
      ];
  }
};
