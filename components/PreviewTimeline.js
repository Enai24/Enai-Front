// src/components/PreviewTimeline.js

import React from 'react';
import { Mail, Phone, Linkedin, FileText, CheckCircle } from 'lucide-react'; // Import icons as before
import { format } from 'date-fns'; // Import date-fns
import { Card } from './BadgeCardProgress'; // Import your Card

const iconMap = { // Define a mapping for dynamic Step type config
  automatic_email: Mail,
  manual_email: Mail,
  phone_call: Phone,
  linkedin_request: Linkedin,
  action_item: FileText,
 approve: CheckCircle,
}

const typeLabel = {
  automatic_email: {
       title: "Automatic Email", // Use to display email details if exist.
       bgColor: "bg-blue-500", //tailwind Css Color, make
   },

   manual_email: { //Handle by same, manual different on data

    title: "Manual Email",
      bgColor: 'bg-blue-500' //blue
  },

   phone_call: { // For type Call
     title: "Phone Call", //
    bgColor: "bg-red-500",

   },

     action_item: { // for support generic/flexible task step.
       title: "Custom Action Item",
        bgColor: 'bg-gray-500',
   },
    linkedin_request: { //LinkedIn contact

    title: 'Linkedin Request',

      bgColor: 'bg-sky-700' //Official color.
   },
    approve: { // Handle if need

        title: "Approved",

       bgColor: 'bg-green-700',
    }

}
function PreviewTimeline({ steps }) { // Step, props from parent/view Components.
    if (!steps || steps.length === 0) {  //If No Step value provide, return early

   return (  //Handle Loading Data and Display to user
      <Card className="p-4 text-center">  {/*You may apply your default Style Component, and text center. */}
        <p className="text-gray-300">No steps added to this sequence yet.</p>

            </Card>

        );

    }
 //If Value ready, return a render content

 return (  // Use Card Wrapper to make it clean.
        <Card className="relative  p-4">
      <h3 className="text-lg font-semibold text-gray-100 mb-4">Sequence Preview</h3>

        {/* Main, Vertical List */}
      <div className="relative flex flex-col gap-4">
             {/* Connecting line - placed absolutely within the container */}
                <div className="absolute left-4 top-0 h-full border-r border-gray-700"></div>  {/*Connect Icon Style.*/}
             {steps.map((step, index) => {
          const StepIcon = iconMap[step.type] || FileText; //  Set Icon
            const stepConfig = typeLabel[step.type]; // Data to handle all related and match with a correct

             const formattedDate = step.deliveryTime ? format(new Date(step.deliveryTime), 'PPpp') : 'Immediately';
         let previewTitle = stepConfig? stepConfig.title : "Unnamed Step"

            return (
                    <div key={index} className="relative flex items-start pl-10">  {/*Put some margin-left with content, make a gap between vertical-line with flex-start layout, to make sure*/}
               {/* Icon and circle - vertically centered */}
                       <div className="absolute left-2 top-1/2 transform -translate-y-1/2"> {/* Layout Positioning for put Icon/ */}

               <div className={`${stepConfig.bgColor} p-2 rounded-full`}>
                     <StepIcon className="w-4 h-4 text-white" />

                </div>
   </div>

           <div className="flex-grow">  {/* Allow data expand  */}

                  <p className="text-sm text-gray-100 font-medium">{previewTitle}</p>
                   {/*Dynamic show more info depend StepType. */}
            {step.type.includes('email') && step.variations && step.variations.length > 0 && (
               <div>
                    {step.variations.map((v) => (<>
                        <p> Subject A: <strong className='text-white'>{v.subject}</strong></p>
                         {/* 
                            <p> Content B </p>
                            {v.body}

                            */}

                       </>)

                     )}
               </div>
               )

          }

                  {step.type === 'action_item' && <p className="text-gray-200 text-xs">{step.title || ''}</p>}
               {step.type == "phone_call" && <span> Call</span>}
     </div>

                {/* Right Aligned Data part, display on detail View of Sequence Steps.*/}
             <div className="text-xs text-gray-400 ">
                 {formattedDate}

         </div>
      </div>
             );

     })}
    </div>
   </Card>

 );

}

export default PreviewTimeline;