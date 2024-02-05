"use client";
import JsonFormatter from "react-json-formatter";
import JsonTextArea from "./components/JsonTextArea/JsonTextArea";

const JsonPrettyLinter = () => {
  const sample = `{
   "string":"ABCDE",
   "number":1,
   "null":null,
   "boolean":true,
   "object":{
      "string":"ABCDE",
      "number":1,
      "null":null,
      "boolean":true
   },
   "array":[
      1,
      2,
      3,
      4,
      {
      "string":"ABCDE",
      "number":1,
      "null":null,
      "boolean":true,
         "array":[
      1,
      2,
      3,
      4,
      {
      "string":"ABCDE",
      "number":1,
      "null":null,
      "boolean":true
   }
   ]
   }
   ]
}
`;

  const jsonStyle = {
    propertyStyle: { color: "red" },
    stringStyle: { color: "green" },
    numberStyle: { color: "darkorange" },
  };

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex-1">
        <JsonTextArea />
      </div>
      <div className="flex-1">
        <JsonFormatter json={sample} tabWith={4} jsonStyle={jsonStyle} />
      </div>
    </div>
  );
};

export default JsonPrettyLinter;
