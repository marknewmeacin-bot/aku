import React from "react";

type SpecialComboDataType = {
  offers: any[];
  message: string;
  success: boolean;
};
const SpecialCombos = ({ comboData }: { comboData: SpecialComboDataType }) => {
  return (
    <div className="container mx-auto px-4 mb-[20px]">
      <div className="heading my-[10px] ownContainer text-center uppercase sm:my-[40px]">
        SPECIAL COMBOS
      </div>
      <div className="relative">
        <div className="flex overflow-x-auto gap-[20px] sm:justify-center scroll-smooth no-scrollbar">
          {comboData.offers.map((combo) => (
            <div
              key={combo._id}
              className="w-[min(80vw,347px)] flex-shrink-0 sm:w-[min(30vw,347px)]"
            >
              <img
                src={combo.images?.[0]?.url || ""}
                alt={combo.title}
                className="block h-auto max-h-[60vh] w-full max-w-full object-contain"
                loading="lazy"
              />
              <p className="text-center uppercase textGap font-[500]">
                {combo.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SpecialCombos;
