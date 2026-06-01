export default function LoadingStudioPage() {
  return (
    <div className="space-y-8 animate-pulse">
      
      {/* TOP */}

      <div
        className="
        flex
        flex-col
        lg:flex-row
        lg:items-center
        lg:justify-between
        gap-5
        "
      >
        <div className="space-y-3">
          <div
            className="
            h-8
            w-64
            rounded-xl
            bg-zinc-200
            dark:bg-zinc-800
            "
          />

          <div
            className="
            h-4
            w-80
            rounded-xl
            bg-zinc-200
            dark:bg-zinc-800
            "
          />
        </div>

        <div
          className="
          h-12
          w-52
          rounded-2xl
          bg-zinc-200
          dark:bg-zinc-800
          "
        />
      </div>

      {/* MAIN GRID */}

      <div
        className="
        grid
        grid-cols-1
        xl:grid-cols-12
        gap-8
        "
      >
        
        {/* LEFT */}

        <div
          className="
          xl:col-span-4
          space-y-6
          "
        >
          
          {/* IMAGE CARD */}

          <div
            className="
            rounded-3xl
            overflow-hidden
            border
            border-zinc-200
            dark:border-white/5
            bg-white
            dark:bg-[#1f1d1c]
            "
          >
            <div
              className="
              h-[420px]
              bg-zinc-200
              dark:bg-zinc-800
              "
            />

            <div className="p-6 space-y-4">
              <div
                className="
                h-6
                w-56
                rounded-xl
                bg-zinc-200
                dark:bg-zinc-800
                "
              />

              <div
                className="
                h-4
                w-full
                rounded-xl
                bg-zinc-200
                dark:bg-zinc-800
                "
              />

              <div
                className="
                h-4
                w-4/5
                rounded-xl
                bg-zinc-200
                dark:bg-zinc-800
                "
              />
            </div>
          </div>

          {/* REQUIREMENTS */}

          <div
            className="
            rounded-3xl
            border
            border-zinc-200
            dark:border-white/5
            bg-white
            dark:bg-[#1f1d1c]
            p-6
            space-y-5
            "
          >
            <div
              className="
              h-6
              w-40
              rounded-xl
              bg-zinc-200
              dark:bg-zinc-800
              "
            />

            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="
                flex
                items-center
                gap-3
                "
              >
                <div
                  className="
                  w-5
                  h-5
                  rounded-full
                  bg-zinc-200
                  dark:bg-zinc-800
                  "
                />

                <div
                  className="
                  h-4
                  w-48
                  rounded-xl
                  bg-zinc-200
                  dark:bg-zinc-800
                  "
                />
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT */}

        <div
          className="
          xl:col-span-8
          "
        >
          <div
            className="
            grid
            grid-cols-1
            md:grid-cols-2
            gap-6
            "
          >
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="
                rounded-3xl
                overflow-hidden
                border
                border-zinc-200
                dark:border-white/5
                bg-white
                dark:bg-[#1f1d1c]
                "
              >
                
                {/* IMAGE */}

                <div
                  className="
                  h-64
                  bg-zinc-200
                  dark:bg-zinc-800
                  "
                />

                {/* CONTENT */}

                <div className="p-5 space-y-4">
                  
                  <div
                    className="
                    h-5
                    w-40
                    rounded-xl
                    bg-zinc-200
                    dark:bg-zinc-800
                    "
                  />

                  <div
                    className="
                    h-28
                    rounded-2xl
                    bg-zinc-200
                    dark:bg-zinc-800
                    "
                  />

                  <div className="flex gap-3">
                    
                    <div
                      className="
                      flex-1
                      h-12
                      rounded-2xl
                      bg-zinc-200
                      dark:bg-zinc-800
                      "
                    />

                    <div
                      className="
                      flex-1
                      h-12
                      rounded-2xl
                      bg-zinc-200
                      dark:bg-zinc-800
                      "
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* SUBMIT BUTTON */}

          <div
            className="
            mt-8
            h-14
            rounded-3xl
            bg-zinc-200
            dark:bg-zinc-800
            "
          />
        </div>
      </div>
    </div>
  );
}