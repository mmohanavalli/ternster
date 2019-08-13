import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import * as io from 'socket.io-client';
import { Observable, fromEvent, merge, of } from 'rxjs';
import { mapTo } from 'rxjs/operators';
// import csc from 'country-state-city';
import * as moment from "moment/min/moment.min.js";
import async from "async";



@Injectable()
export class GlobalService {
  public apiHost: string;
  public imageURL: string;
  public socket: any = '';

  public languages: any = [];
  public countries: any = [];
  public currency: any = [];

  // public locationLists: any = [];
  // public country_lists: any = [];
  // public state_lists: any = [];
  // public city_lists: any = [];

  onlineStatus: Observable<boolean>;

  constructor() {
    if (environment.production === true) {
      this.apiHost = 'https://ternster.hyperbig.com/api';
      this.imageURL = 'https://ternster.hyperbig.com';
      this.socket = io.connect('https://ternster.hyperbig.com');
    } else {
      this.apiHost = 'http://localhost:3001/api';
      this.imageURL = 'http://localhost:3001'
      this.socket = io.connect('http://localhost:3001');
    }

    this.languages = [
      { code: "ab", name: "Abkhazian" },
      { code: "aa", name: "Afar" },
      { code: "af", name: "Afrikaans" },
      { code: "ak", name: "Akan" },
      { code: "sq", name: "Albanian" },
      { code: "am", name: "Amharic" },
      { code: "ar", name: "Arabic" },
      { code: "an", name: "Aragonese" },
      { code: "hy", name: "Armenian" },
      { code: "as", name: "Assamese" },
      { code: "av", name: "Avaric" },
      { code: "ae", name: "Avestan" },
      { code: "ay", name: "Aymara" },
      { code: "az", name: "Azerbaijani" },
      { code: "bm", name: "Bambara" },
      { code: "ba", name: "Bashkir" },
      { code: "eu", name: "Basque" },
      { code: "be", name: "Belarusian" },
      { code: "bn", name: "Bengali" },
      { code: "bh", name: "Bihari languages" },
      { code: "bi", name: "Bislama" },
      { code: "bs", name: "Bosnian" },
      { code: "br", name: "Breton" },
      { code: "bg", name: "Bulgarian" },
      { code: "my", name: "Burmese" },
      { code: "ca", name: "Catalan, Valencian" },
      { code: "km", name: "Central Khmer" },
      { code: "ch", name: "Chamorro" },
      { code: "ce", name: "Chechen" },
      { code: "ny", name: "Chichewa, Chewa, Nyanja" },
      { code: "zh", name: "Chinese" },
      { code: "cu", name: "Church Slavonic, Old Bulgarian, Old Church Slavonic" },
      { code: "cv", name: "Chuvash" },
      { code: "kw", name: "Cornish" },
      { code: "co", name: "Corsican" },
      { code: "cr", name: "Cree" },
      { code: "hr", name: "Croatian" },
      { code: "cs", name: "Czech" },
      { code: "da", name: "Danish" },
      { code: "dv", name: "Divehi, Dhivehi, Maldivian" },
      { code: "nl", name: "Dutch, Flemish" },
      { code: "dz", name: "Dzongkha" },
      { code: "en", name: "English" },
      { code: "eo", name: "Esperanto" },
      { code: "et", name: "Estonian" },
      { code: "ee", name: "Ewe" },
      { code: "fo", name: "Faroese" },
      { code: "fj", name: "Fijian" },
      { code: "fi", name: "Finnish" },
      { code: "fr", name: "French" },
      { code: "ff", name: "Fulah" },
      { code: "gd", name: "Gaelic, Scottish Gaelic" },
      { code: "gl", name: "Galician" },
      { code: "lg", name: "Ganda" },
      { code: "ka", name: "Georgian" },
      { code: "de", name: "German" },
      { code: "ki", name: "Gikuyu, Kikuyu" },
      { code: "el", name: "Greek (Modern)" },
      { code: "kl", name: "Greenlandic, Kalaallisut" },
      { code: "gn", name: "Guarani" },
      { code: "gu", name: "Gujarati" },
      { code: "ht", name: "Haitian, Haitian Creole" },
      { code: "ha", name: "Hausa" },
      { code: "he", name: "Hebrew" },
      { code: "hz", name: "Herero" },
      { code: "hi", name: "Hindi" },
      { code: "ho", name: "Hiri Motu" },
      { code: "hu", name: "Hungarian" },
      { code: "is", name: "Icelandic" },
      { code: "io", name: "Ido" },
      { code: "ig", name: "Igbo" },
      { code: "id", name: "Indonesian" },
      { code: "ia", name: "Interlingua (International Auxiliary Language Association)" },
      { code: "ie", name: "Interlingue" },
      { code: "iu", name: "Inuktitut" },
      { code: "ik", name: "Inupiaq" },
      { code: "ga", name: "Irish" },
      { code: "it", name: "Italian" },
      { code: "ja", name: "Japanese" },
      { code: "jv", name: "Javanese" },
      { code: "kn", name: "Kannada" },
      { code: "kr", name: "Kanuri" },
      { code: "ks", name: "Kashmiri" },
      { code: "kk", name: "Kazakh" },
      { code: "rw", name: "Kinyarwanda" },
      { code: "kv", name: "Komi" },
      { code: "kg", name: "Kongo" },
      { code: "ko", name: "Korean" },
      { code: "kj", name: "Kwanyama, Kuanyama" },
      { code: "ku", name: "Kurdish" },
      { code: "ky", name: "Kyrgyz" },
      { code: "lo", name: "Lao" },
      { code: "la", name: "Latin" },
      { code: "lv", name: "Latvian" },
      { code: "lb", name: "Letzeburgesch, Luxembourgish" },
      { code: "li", name: "Limburgish, Limburgan, Limburger" },
      { code: "ln", name: "Lingala" },
      { code: "lt", name: "Lithuanian" },
      { code: "lu", name: "Luba-Katanga" },
      { code: "mk", name: "Macedonian" },
      { code: "mg", name: "Malagasy" },
      { code: "ms", name: "Malay" },
      { code: "ml", name: "Malayalam" },
      { code: "mt", name: "Maltese" },
      { code: "gv", name: "Manx" },
      { code: "mi", name: "Maori" },
      { code: "mr", name: "Marathi" },
      { code: "mh", name: "Marshallese" },
      { code: "ro", name: "Moldovan, Moldavian, Romanian" },
      { code: "mn", name: "Mongolian" },
      { code: "na", name: "Nauru" },
      { code: "nv", name: "Navajo, Navaho" },
      { code: "nd", name: "Northern Ndebele" },
      { code: "ng", name: "Ndonga" },
      { code: "ne", name: "Nepali" },
      { code: "se", name: "Northern Sami" },
      { code: "no", name: "Norwegian" },
      { code: "nb", name: "Norwegian Bokmål" },
      { code: "nn", name: "Norwegian Nynorsk" },
      { code: "ii", name: "Nuosu, Sichuan Yi" },
      { code: "oc", name: "Occitan (post 1500)" },
      { code: "oj", name: "Ojibwa" },
      { code: "or", name: "Oriya" },
      { code: "om", name: "Oromo" },
      { code: "os", name: "Ossetian, Ossetic" },
      { code: "pi", name: "Pali" },
      { code: "pa", name: "Panjabi, Punjabi" },
      { code: "ps", name: "Pashto, Pushto" },
      { code: "fa", name: "Persian" },
      { code: "pl", name: "Polish" },
      { code: "pt", name: "Portuguese" },
      { code: "qu", name: "Quechua" },
      { code: "rm", name: "Romansh" },
      { code: "rn", name: "Rundi" },
      { code: "ru", name: "Russian" },
      { code: "sm", name: "Samoan" },
      { code: "sg", name: "Sango" },
      { code: "sa", name: "Sanskrit" },
      { code: "sc", name: "Sardinian" },
      { code: "sr", name: "Serbian" },
      { code: "sn", name: "Shona" },
      { code: "sd", name: "Sindhi" },
      { code: "si", name: "Sinhala, Sinhalese" },
      { code: "sk", name: "Slovak" },
      { code: "sl", name: "Slovenian" },
      { code: "so", name: "Somali" },
      { code: "st", name: "Sotho, Southern" },
      { code: "nr", name: "South Ndebele" },
      { code: "es", name: "Spanish, Castilian" },
      { code: "su", name: "Sundanese" },
      { code: "sw", name: "Swahili" },
      { code: "ss", name: "Swati" },
      { code: "sv", name: "Swedish" },
      { code: "tl", name: "Tagalog" },
      { code: "ty", name: "Tahitian" },
      { code: "tg", name: "Tajik" },
      { code: "ta", name: "Tamil" },
      { code: "tt", name: "Tatar" },
      { code: "te", name: "Telugu" },
      { code: "th", name: "Thai" },
      { code: "bo", name: "Tibetan" },
      { code: "ti", name: "Tigrinya" },
      { code: "to", name: "Tonga (Tonga Islands)" },
      { code: "ts", name: "Tsonga" },
      { code: "tn", name: "Tswana" },
      { code: "tr", name: "Turkish" },
      { code: "tk", name: "Turkmen" },
      { code: "tw", name: "Twi" },
      { code: "ug", name: "Uighur, Uyghur" },
      { code: "uk", name: "Ukrainian" },
      { code: "ur", name: "Urdu" },
      { code: "uz", name: "Uzbek" },
      { code: "ve", name: "Venda" },
      { code: "vi", name: "Vietnamese" },
      { code: "vo", name: "Volap_k" },
      { code: "wa", name: "Walloon" },
      { code: "cy", name: "Welsh" },
      { code: "fy", name: "Western Frisian" },
      { code: "wo", name: "Wolof" },
      { code: "xh", name: "Xhosa" },
      { code: "yi", name: "Yiddish" },
      { code: "yo", name: "Yoruba" },
      { code: "za", name: "Zhuang, Chuang" },
      { code: "zu", name: "Zulu" }
    ];

    this.currency = [{ "symbol": "$", "name": "US Dollar", "symbol_native": "$", "decimal_digits": 2, "rounding": 0, "code": "USD", "name_plural": "US dollars" }, { "symbol": "CA$", "name": "Canadian Dollar", "symbol_native": "$", "decimal_digits": 2, "rounding": 0, "code": "CAD", "name_plural": "Canadian dollars" }, { "symbol": "€", "name": "Euro", "symbol_native": "€", "decimal_digits": 2, "rounding": 0, "code": "EUR", "name_plural": "euros" }, { "symbol": "AED", "name": "United Arab Emirates Dirham", "symbol_native": "د.إ.‏", "decimal_digits": 2, "rounding": 0, "code": "AED", "name_plural": "UAE dirhams" }, { "symbol": "Af", "name": "Afghan Afghani", "symbol_native": "؋", "decimal_digits": 0, "rounding": 0, "code": "AFN", "name_plural": "Afghan Afghanis" }, { "symbol": "ALL", "name": "Albanian Lek", "symbol_native": "Lek", "decimal_digits": 0, "rounding": 0, "code": "ALL", "name_plural": "Albanian lekë" }, { "symbol": "AMD", "name": "Armenian Dram", "symbol_native": "դր.", "decimal_digits": 0, "rounding": 0, "code": "AMD", "name_plural": "Armenian drams" }, { "symbol": "AR$", "name": "Argentine Peso", "symbol_native": "$", "decimal_digits": 2, "rounding": 0, "code": "ARS", "name_plural": "Argentine pesos" }, { "symbol": "AU$", "name": "Australian Dollar", "symbol_native": "$", "decimal_digits": 2, "rounding": 0, "code": "AUD", "name_plural": "Australian dollars" }, { "symbol": "man.", "name": "Azerbaijani Manat", "symbol_native": "ман.", "decimal_digits": 2, "rounding": 0, "code": "AZN", "name_plural": "Azerbaijani manats" }, { "symbol": "KM", "name": "Bosnia-Herzegovina Convertible Mark", "symbol_native": "KM", "decimal_digits": 2, "rounding": 0, "code": "BAM", "name_plural": "Bosnia-Herzegovina convertible marks" }, { "symbol": "Tk", "name": "Bangladeshi Taka", "symbol_native": "৳", "decimal_digits": 2, "rounding": 0, "code": "BDT", "name_plural": "Bangladeshi takas" }, { "symbol": "BGN", "name": "Bulgarian Lev", "symbol_native": "лв.", "decimal_digits": 2, "rounding": 0, "code": "BGN", "name_plural": "Bulgarian leva" }, { "symbol": "BD", "name": "Bahraini Dinar", "symbol_native": "د.ب.‏", "decimal_digits": 3, "rounding": 0, "code": "BHD", "name_plural": "Bahraini dinars" }, { "symbol": "FBu", "name": "Burundian Franc", "symbol_native": "FBu", "decimal_digits": 0, "rounding": 0, "code": "BIF", "name_plural": "Burundian francs" }, { "symbol": "BN$", "name": "Brunei Dollar", "symbol_native": "$", "decimal_digits": 2, "rounding": 0, "code": "BND", "name_plural": "Brunei dollars" }, { "symbol": "Bs", "name": "Bolivian Boliviano", "symbol_native": "Bs", "decimal_digits": 2, "rounding": 0, "code": "BOB", "name_plural": "Bolivian bolivianos" }, { "symbol": "R$", "name": "Brazilian Real", "symbol_native": "R$", "decimal_digits": 2, "rounding": 0, "code": "BRL", "name_plural": "Brazilian reals" }, { "symbol": "BWP", "name": "Botswanan Pula", "symbol_native": "P", "decimal_digits": 2, "rounding": 0, "code": "BWP", "name_plural": "Botswanan pulas" }, { "symbol": "BYR", "name": "Belarusian Ruble", "symbol_native": "BYR", "decimal_digits": 0, "rounding": 0, "code": "BYR", "name_plural": "Belarusian rubles" }, { "symbol": "BZ$", "name": "Belize Dollar", "symbol_native": "$", "decimal_digits": 2, "rounding": 0, "code": "BZD", "name_plural": "Belize dollars" }, { "symbol": "CDF", "name": "Congolese Franc", "symbol_native": "FrCD", "decimal_digits": 2, "rounding": 0, "code": "CDF", "name_plural": "Congolese francs" }, { "symbol": "CHF", "name": "Swiss Franc", "symbol_native": "CHF", "decimal_digits": 2, "rounding": 0.05, "code": "CHF", "name_plural": "Swiss francs" }, { "symbol": "CL$", "name": "Chilean Peso", "symbol_native": "$", "decimal_digits": 0, "rounding": 0, "code": "CLP", "name_plural": "Chilean pesos" }, { "symbol": "CN¥", "name": "Chinese Yuan", "symbol_native": "CN¥", "decimal_digits": 2, "rounding": 0, "code": "CNY", "name_plural": "Chinese yuan" }, { "symbol": "CO$", "name": "Colombian Peso", "symbol_native": "$", "decimal_digits": 0, "rounding": 0, "code": "COP", "name_plural": "Colombian pesos" }, { "symbol": "₡", "name": "Costa Rican Colón", "symbol_native": "₡", "decimal_digits": 0, "rounding": 0, "code": "CRC", "name_plural": "Costa Rican colóns" }, { "symbol": "CV$", "name": "Cape Verdean Escudo", "symbol_native": "CV$", "decimal_digits": 2, "rounding": 0, "code": "CVE", "name_plural": "Cape Verdean escudos" }, { "symbol": "Kč", "name": "Czech Republic Koruna", "symbol_native": "Kč", "decimal_digits": 2, "rounding": 0, "code": "CZK", "name_plural": "Czech Republic korunas" }, { "symbol": "Fdj", "name": "Djiboutian Franc", "symbol_native": "Fdj", "decimal_digits": 0, "rounding": 0, "code": "DJF", "name_plural": "Djiboutian francs" }, { "symbol": "Dkr", "name": "Danish Krone", "symbol_native": "kr", "decimal_digits": 2, "rounding": 0, "code": "DKK", "name_plural": "Danish kroner" }, { "symbol": "RD$", "name": "Dominican Peso", "symbol_native": "RD$", "decimal_digits": 2, "rounding": 0, "code": "DOP", "name_plural": "Dominican pesos" }, { "symbol": "DA", "name": "Algerian Dinar", "symbol_native": "د.ج.‏", "decimal_digits": 2, "rounding": 0, "code": "DZD", "name_plural": "Algerian dinars" }, { "symbol": "Ekr", "name": "Estonian Kroon", "symbol_native": "kr", "decimal_digits": 2, "rounding": 0, "code": "EEK", "name_plural": "Estonian kroons" }, { "symbol": "EGP", "name": "Egyptian Pound", "symbol_native": "ج.م.‏", "decimal_digits": 2, "rounding": 0, "code": "EGP", "name_plural": "Egyptian pounds" }, { "symbol": "Nfk", "name": "Eritrean Nakfa", "symbol_native": "Nfk", "decimal_digits": 2, "rounding": 0, "code": "ERN", "name_plural": "Eritrean nakfas" }, { "symbol": "Br", "name": "Ethiopian Birr", "symbol_native": "Br", "decimal_digits": 2, "rounding": 0, "code": "ETB", "name_plural": "Ethiopian birrs" }, { "symbol": "£", "name": "British Pound Sterling", "symbol_native": "£", "decimal_digits": 2, "rounding": 0, "code": "GBP", "name_plural": "British pounds sterling" }, { "symbol": "GEL", "name": "Georgian Lari", "symbol_native": "GEL", "decimal_digits": 2, "rounding": 0, "code": "GEL", "name_plural": "Georgian laris" }, { "symbol": "GH₵", "name": "Ghanaian Cedi", "symbol_native": "GH₵", "decimal_digits": 2, "rounding": 0, "code": "GHS", "name_plural": "Ghanaian cedis" }, { "symbol": "FG", "name": "Guinean Franc", "symbol_native": "FG", "decimal_digits": 0, "rounding": 0, "code": "GNF", "name_plural": "Guinean francs" }, { "symbol": "GTQ", "name": "Guatemalan Quetzal", "symbol_native": "Q", "decimal_digits": 2, "rounding": 0, "code": "GTQ", "name_plural": "Guatemalan quetzals" }, { "symbol": "HK$", "name": "Hong Kong Dollar", "symbol_native": "$", "decimal_digits": 2, "rounding": 0, "code": "HKD", "name_plural": "Hong Kong dollars" }, { "symbol": "HNL", "name": "Honduran Lempira", "symbol_native": "L", "decimal_digits": 2, "rounding": 0, "code": "HNL", "name_plural": "Honduran lempiras" }, { "symbol": "kn", "name": "Croatian Kuna", "symbol_native": "kn", "decimal_digits": 2, "rounding": 0, "code": "HRK", "name_plural": "Croatian kunas" }, { "symbol": "Ft", "name": "Hungarian Forint", "symbol_native": "Ft", "decimal_digits": 0, "rounding": 0, "code": "HUF", "name_plural": "Hungarian forints" }, { "symbol": "Rp", "name": "Indonesian Rupiah", "symbol_native": "Rp", "decimal_digits": 0, "rounding": 0, "code": "IDR", "name_plural": "Indonesian rupiahs" }, { "symbol": "₪", "name": "Israeli New Sheqel", "symbol_native": "₪", "decimal_digits": 2, "rounding": 0, "code": "ILS", "name_plural": "Israeli new sheqels" }, { "symbol": "₹", "name": "Indian Rupee", "symbol_native": "টকা", "decimal_digits": 2, "rounding": 0, "code": "INR", "name_plural": "Indian rupees" }, { "symbol": "IQD", "name": "Iraqi Dinar", "symbol_native": "د.ع.‏", "decimal_digits": 0, "rounding": 0, "code": "IQD", "name_plural": "Iraqi dinars" }, { "symbol": "IRR", "name": "Iranian Rial", "symbol_native": "﷼", "decimal_digits": 0, "rounding": 0, "code": "IRR", "name_plural": "Iranian rials" }, { "symbol": "Ikr", "name": "Icelandic Króna", "symbol_native": "kr", "decimal_digits": 0, "rounding": 0, "code": "ISK", "name_plural": "Icelandic krónur" }, { "symbol": "J$", "name": "Jamaican Dollar", "symbol_native": "$", "decimal_digits": 2, "rounding": 0, "code": "JMD", "name_plural": "Jamaican dollars" }, { "symbol": "JD", "name": "Jordanian Dinar", "symbol_native": "د.أ.‏", "decimal_digits": 3, "rounding": 0, "code": "JOD", "name_plural": "Jordanian dinars" }, { "symbol": "¥", "name": "Japanese Yen", "symbol_native": "￥", "decimal_digits": 0, "rounding": 0, "code": "JPY", "name_plural": "Japanese yen" }, { "symbol": "Ksh", "name": "Kenyan Shilling", "symbol_native": "Ksh", "decimal_digits": 2, "rounding": 0, "code": "KES", "name_plural": "Kenyan shillings" }, { "symbol": "KHR", "name": "Cambodian Riel", "symbol_native": "៛", "decimal_digits": 2, "rounding": 0, "code": "KHR", "name_plural": "Cambodian riels" }, { "symbol": "CF", "name": "Comorian Franc", "symbol_native": "FC", "decimal_digits": 0, "rounding": 0, "code": "KMF", "name_plural": "Comorian francs" }, { "symbol": "₩", "name": "South Korean Won", "symbol_native": "₩", "decimal_digits": 0, "rounding": 0, "code": "KRW", "name_plural": "South Korean won" }, { "symbol": "KD", "name": "Kuwaiti Dinar", "symbol_native": "د.ك.‏", "decimal_digits": 3, "rounding": 0, "code": "KWD", "name_plural": "Kuwaiti dinars" }, { "symbol": "KZT", "name": "Kazakhstani Tenge", "symbol_native": "тңг.", "decimal_digits": 2, "rounding": 0, "code": "KZT", "name_plural": "Kazakhstani tenges" }, { "symbol": "LB£", "name": "Lebanese Pound", "symbol_native": "ل.ل.‏", "decimal_digits": 0, "rounding": 0, "code": "LBP", "name_plural": "Lebanese pounds" }, { "symbol": "SLRs", "name": "Sri Lankan Rupee", "symbol_native": "SL Re", "decimal_digits": 2, "rounding": 0, "code": "LKR", "name_plural": "Sri Lankan rupees" }, { "symbol": "Lt", "name": "Lithuanian Litas", "symbol_native": "Lt", "decimal_digits": 2, "rounding": 0, "code": "LTL", "name_plural": "Lithuanian litai" }, { "symbol": "Ls", "name": "Latvian Lats", "symbol_native": "Ls", "decimal_digits": 2, "rounding": 0, "code": "LVL", "name_plural": "Latvian lati" }, { "symbol": "LD", "name": "Libyan Dinar", "symbol_native": "د.ل.‏", "decimal_digits": 3, "rounding": 0, "code": "LYD", "name_plural": "Libyan dinars" }, { "symbol": "MAD", "name": "Moroccan Dirham", "symbol_native": "د.م.‏", "decimal_digits": 2, "rounding": 0, "code": "MAD", "name_plural": "Moroccan dirhams" }, { "symbol": "MDL", "name": "Moldovan Leu", "symbol_native": "MDL", "decimal_digits": 2, "rounding": 0, "code": "MDL", "name_plural": "Moldovan lei" }, { "symbol": "MGA", "name": "Malagasy Ariary", "symbol_native": "MGA", "decimal_digits": 0, "rounding": 0, "code": "MGA", "name_plural": "Malagasy Ariaries" }, { "symbol": "MKD", "name": "Macedonian Denar", "symbol_native": "MKD", "decimal_digits": 2, "rounding": 0, "code": "MKD", "name_plural": "Macedonian denari" }, { "symbol": "MMK", "name": "Myanma Kyat", "symbol_native": "K", "decimal_digits": 0, "rounding": 0, "code": "MMK", "name_plural": "Myanma kyats" }, { "symbol": "MOP$", "name": "Macanese Pataca", "symbol_native": "MOP$", "decimal_digits": 2, "rounding": 0, "code": "MOP", "name_plural": "Macanese patacas" }, { "symbol": "MURs", "name": "Mauritian Rupee", "symbol_native": "MURs", "decimal_digits": 0, "rounding": 0, "code": "MUR", "name_plural": "Mauritian rupees" }, { "symbol": "MX$", "name": "Mexican Peso", "symbol_native": "$", "decimal_digits": 2, "rounding": 0, "code": "MXN", "name_plural": "Mexican pesos" }, { "symbol": "RM", "name": "Malaysian Ringgit", "symbol_native": "RM", "decimal_digits": 2, "rounding": 0, "code": "MYR", "name_plural": "Malaysian ringgits" }, { "symbol": "MTn", "name": "Mozambican Metical", "symbol_native": "MTn", "decimal_digits": 2, "rounding": 0, "code": "MZN", "name_plural": "Mozambican meticals" }, { "symbol": "N$", "name": "Namibian Dollar", "symbol_native": "N$", "decimal_digits": 2, "rounding": 0, "code": "NAD", "name_plural": "Namibian dollars" }, { "symbol": "₦", "name": "Nigerian Naira", "symbol_native": "₦", "decimal_digits": 2, "rounding": 0, "code": "NGN", "name_plural": "Nigerian nairas" }, { "symbol": "C$", "name": "Nicaraguan Córdoba", "symbol_native": "C$", "decimal_digits": 2, "rounding": 0, "code": "NIO", "name_plural": "Nicaraguan córdobas" }, { "symbol": "Nkr", "name": "Norwegian Krone", "symbol_native": "kr", "decimal_digits": 2, "rounding": 0, "code": "NOK", "name_plural": "Norwegian kroner" }, { "symbol": "NPRs", "name": "Nepalese Rupee", "symbol_native": "नेरू", "decimal_digits": 2, "rounding": 0, "code": "NPR", "name_plural": "Nepalese rupees" }, { "symbol": "NZ$", "name": "New Zealand Dollar", "symbol_native": "$", "decimal_digits": 2, "rounding": 0, "code": "NZD", "name_plural": "New Zealand dollars" }, { "symbol": "OMR", "name": "Omani Rial", "symbol_native": "ر.ع.‏", "decimal_digits": 3, "rounding": 0, "code": "OMR", "name_plural": "Omani rials" }, { "symbol": "B/.", "name": "Panamanian Balboa", "symbol_native": "B/.", "decimal_digits": 2, "rounding": 0, "code": "PAB", "name_plural": "Panamanian balboas" }, { "symbol": "S/.", "name": "Peruvian Nuevo Sol", "symbol_native": "S/.", "decimal_digits": 2, "rounding": 0, "code": "PEN", "name_plural": "Peruvian nuevos soles" }, { "symbol": "₱", "name": "Philippine Peso", "symbol_native": "₱", "decimal_digits": 2, "rounding": 0, "code": "PHP", "name_plural": "Philippine pesos" }, { "symbol": "PKRs", "name": "Pakistani Rupee", "symbol_native": "₨", "decimal_digits": 0, "rounding": 0, "code": "PKR", "name_plural": "Pakistani rupees" }, { "symbol": "zł", "name": "Polish Zloty", "symbol_native": "zł", "decimal_digits": 2, "rounding": 0, "code": "PLN", "name_plural": "Polish zlotys" }, { "symbol": "₲", "name": "Paraguayan Guarani", "symbol_native": "₲", "decimal_digits": 0, "rounding": 0, "code": "PYG", "name_plural": "Paraguayan guaranis" }, { "symbol": "QR", "name": "Qatari Rial", "symbol_native": "ر.ق.‏", "decimal_digits": 2, "rounding": 0, "code": "QAR", "name_plural": "Qatari rials" }, { "symbol": "RON", "name": "Romanian Leu", "symbol_native": "RON", "decimal_digits": 2, "rounding": 0, "code": "RON", "name_plural": "Romanian lei" }, { "symbol": "din.", "name": "Serbian Dinar", "symbol_native": "дин.", "decimal_digits": 0, "rounding": 0, "code": "RSD", "name_plural": "Serbian dinars" }, { "symbol": "RUB", "name": "Russian Ruble", "symbol_native": "руб.", "decimal_digits": 2, "rounding": 0, "code": "RUB", "name_plural": "Russian rubles" }, { "symbol": "RWF", "name": "Rwandan Franc", "symbol_native": "FR", "decimal_digits": 0, "rounding": 0, "code": "RWF", "name_plural": "Rwandan francs" }, { "symbol": "SR", "name": "Saudi Riyal", "symbol_native": "ر.س.‏", "decimal_digits": 2, "rounding": 0, "code": "SAR", "name_plural": "Saudi riyals" }, { "symbol": "SDG", "name": "Sudanese Pound", "symbol_native": "SDG", "decimal_digits": 2, "rounding": 0, "code": "SDG", "name_plural": "Sudanese pounds" }, { "symbol": "Skr", "name": "Swedish Krona", "symbol_native": "kr", "decimal_digits": 2, "rounding": 0, "code": "SEK", "name_plural": "Swedish kronor" }, { "symbol": "S$", "name": "Singapore Dollar", "symbol_native": "$", "decimal_digits": 2, "rounding": 0, "code": "SGD", "name_plural": "Singapore dollars" }, { "symbol": "Ssh", "name": "Somali Shilling", "symbol_native": "Ssh", "decimal_digits": 0, "rounding": 0, "code": "SOS", "name_plural": "Somali shillings" }, { "symbol": "SY£", "name": "Syrian Pound", "symbol_native": "ل.س.‏", "decimal_digits": 0, "rounding": 0, "code": "SYP", "name_plural": "Syrian pounds" }, { "symbol": "฿", "name": "Thai Baht", "symbol_native": "฿", "decimal_digits": 2, "rounding": 0, "code": "THB", "name_plural": "Thai baht" }, { "symbol": "DT", "name": "Tunisian Dinar", "symbol_native": "د.ت.‏", "decimal_digits": 3, "rounding": 0, "code": "TND", "name_plural": "Tunisian dinars" }, { "symbol": "T$", "name": "Tongan Paʻanga", "symbol_native": "T$", "decimal_digits": 2, "rounding": 0, "code": "TOP", "name_plural": "Tongan paʻanga" }, { "symbol": "TL", "name": "Turkish Lira", "symbol_native": "TL", "decimal_digits": 2, "rounding": 0, "code": "TRY", "name_plural": "Turkish Lira" }, { "symbol": "TT$", "name": "Trinidad and Tobago Dollar", "symbol_native": "$", "decimal_digits": 2, "rounding": 0, "code": "TTD", "name_plural": "Trinidad and Tobago dollars" }, { "symbol": "NT$", "name": "New Taiwan Dollar", "symbol_native": "NT$", "decimal_digits": 2, "rounding": 0, "code": "TWD", "name_plural": "New Taiwan dollars" }, { "symbol": "TSh", "name": "Tanzanian Shilling", "symbol_native": "TSh", "decimal_digits": 0, "rounding": 0, "code": "TZS", "name_plural": "Tanzanian shillings" }, { "symbol": "₴", "name": "Ukrainian Hryvnia", "symbol_native": "₴", "decimal_digits": 2, "rounding": 0, "code": "UAH", "name_plural": "Ukrainian hryvnias" }, { "symbol": "USh", "name": "Ugandan Shilling", "symbol_native": "USh", "decimal_digits": 0, "rounding": 0, "code": "UGX", "name_plural": "Ugandan shillings" }, { "symbol": "$U", "name": "Uruguayan Peso", "symbol_native": "$", "decimal_digits": 2, "rounding": 0, "code": "UYU", "name_plural": "Uruguayan pesos" }, { "symbol": "UZS", "name": "Uzbekistan Som", "symbol_native": "UZS", "decimal_digits": 0, "rounding": 0, "code": "UZS", "name_plural": "Uzbekistan som" }, { "symbol": "Bs.F.", "name": "Venezuelan Bolívar", "symbol_native": "Bs.F.", "decimal_digits": 2, "rounding": 0, "code": "VEF", "name_plural": "Venezuelan bolívars" }, { "symbol": "₫", "name": "Vietnamese Dong", "symbol_native": "₫", "decimal_digits": 0, "rounding": 0, "code": "VND", "name_plural": "Vietnamese dong" }, { "symbol": "FCFA", "name": "CFA Franc BEAC", "symbol_native": "FCFA", "decimal_digits": 0, "rounding": 0, "code": "XAF", "name_plural": "CFA francs BEAC" }, { "symbol": "CFA", "name": "CFA Franc BCEAO", "symbol_native": "CFA", "decimal_digits": 0, "rounding": 0, "code": "XOF", "name_plural": "CFA francs BCEAO" }, { "symbol": "YR", "name": "Yemeni Rial", "symbol_native": "ر.ي.‏", "decimal_digits": 0, "rounding": 0, "code": "YER", "name_plural": "Yemeni rials" }, { "symbol": "R", "name": "South African Rand", "symbol_native": "R", "decimal_digits": 2, "rounding": 0, "code": "ZAR", "name_plural": "South African rand" }, { "symbol": "ZK", "name": "Zambian Kwacha", "symbol_native": "ZK", "decimal_digits": 0, "rounding": 0, "code": "ZMK", "name_plural": "Zambian kwachas" }]

  }
  ordinal_suffix_of(i: number) {
    var j = i % 10,
      k = i % 100;
    if (j == 1 && k != 11) {
      return "st";
    }
    if (j == 2 && k != 12) {
      return "nd";
    }
    if (j == 3 && k != 13) {
      return "rd";
    }
    return "th";
  }

  checkIsNewTrip(trip_created_at) {
    let current_date_for_new = moment().format('YYYY-MM-DD');
    let trip_create_at = moment(trip_created_at).format('YYYY-MM-DD');
    if (trip_create_at == current_date_for_new) {
      return true;
    } else {
      return false;
    }

  }

  /**************Split the list of langauages******************* */
  getLanguages(languages) {
    let language_arr = [];
    return language_arr = languages
      .split(",")
      .map(function (item) {
        return item.trim();
      });
  }

  /**************************Requirement for package********************************************/
  getShipmentData(lists, trip_type, trip_location, token_object, list, nameOfFunc) {
    let shipment_data_lists = [];
    var root = this;

    if (nameOfFunc == 'tripById') {
      async.forEach(lists, function (list) {
        if (trip_type == "courier") {
          if (trip_location == "myTrip") {
            if (
              list.package_status == "assigned" ||
              list.package_status == "delivered"
            )

              shipment_data_lists.push(root.getCourierShipmentList(list, list.package_status, list.User.name));
          } else {
            let package_status = list.package_status;
            if (list.Invite.status == 'withdraw') {
              package_status = list.Invite.status;
            }

            shipment_data_lists.push(root.getCourierShipmentList(list, package_status, list.User.name));
            console.log("shipment_data_lists", shipment_data_lists);
          }
        } else if (trip_type == "assistance") {
          shipment_data_lists.push(root.getAssistanceShipmentList(list));
        } else if (trip_type == "companion") {
          shipment_data_lists.push({
            id: list.id,
            description: list.description,
            from_date: moment(list.from_date).format("DD-MMM-YYYY"),
            to_date: moment(list.to_date).format("DD-MMM-YYYY"),
            user_name: list.User.name
          });
        }
      });
    } else {
      if (lists) {
        if (trip_type == "courier") {
          let user_name = "";
          if (lists.user_id == token_object.id) {
            user_name = token_object.name;
          } else {
            user_name = lists.User.name;
          }

          let package_status = lists.package_status;
          if (list.request_status == "withdraw") {
            package_status = list.request_status;
          }

          shipment_data_lists.push(root.getCourierShipmentList(lists, package_status, user_name));

        } else if (trip_type == "assistance") {
          shipment_data_lists.push(root.getAssistanceShipmentList(lists));
        } else if (trip_type == "companion") {
          if (list.Trip.trip_plan == "unplanned") {
            shipment_data_lists.push({
              id: lists.id,
              description: lists.description,
              requested: lists.requested,
              from_date: moment(lists.from_date).format("DD-MMM-YYYY"),
              to_date: moment(lists.to_date).format("DD-MMM-YYYY"),
              user_name: lists.User.name
            });
          }
        }
      }
    }

    return shipment_data_lists;

  }

  getPackageImageList(imglists) {
    var image_lists = [];
    var root = this;
    async.forEach(imglists, function (img) {
      image_lists.push({
        img: root.imageURL + "/static/item_images/" + img
      });
    });
    return image_lists;
  }

  getItemList(list) {
    var item_lists = [];
    var item_name = list.item_name.split(",");
    var item_weight = list.item_weight.split(",");
    var item_value = list.item_value.split(",");
    var item_images = list.item_images.split(",");
    console.log("list.item_name", list.item_name);

    for (let i = 0; i < item_name.length; i++) {
      item_lists.push({
        item_name: item_name[i],
        item_weight: item_weight[i],
        item_value: item_value[i],
        item_images: this.imageURL + "/static/item_images/" + item_images[i]
      });
    }

    return item_lists;
  }

  getCourierShipmentList(list, package_status, user_name) {
    let shipment_data_lists = {};
    shipment_data_lists = {
      id: list.id,
      from_date: moment(list.from_date).format("DD-MMM-YYYY"),
      to_date: moment(list.to_date).format("DD-MMM-YYYY"),
      package_name: list.package_name,
      package_description: list.package_description,
      package_weight: list.package_weight,
      weight_unit: list.weight_unit,
      package_images: this.getPackageImageList(list.package_images.split(",")),
      package_status: package_status,
      user_name: user_name,
      item_lists: this.getItemList(list),
      receiver_name: list.receiver_name,
      receiver_contact_no: list.receiver_contact_no,
      receiver_email_id: list.receiver_email_id
    };
    console.log("shipment_data_lists", shipment_data_lists);
    return shipment_data_lists;
  }

  getAssistanceShipmentList(lists) {
    let shipment_data_lists = {};
    shipment_data_lists = {
      id: lists.id,
      description: lists.description,
      members: lists.members,
      requested: lists.requested,
      from_date: moment(lists.from_date).format("DD-MMM-YYYY"),
      to_date: moment(lists.to_date).format("DD-MMM-YYYY"),
      user_name: lists.User.name
    };

    return shipment_data_lists;
  }
}
