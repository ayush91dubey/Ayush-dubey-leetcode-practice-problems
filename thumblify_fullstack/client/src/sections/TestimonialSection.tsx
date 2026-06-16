import SectionTitle from "../components/SectionTitle";
import TestimonialCard from "../components/TestimonialCard";
import { testimonialsData } from "../data/testimonial";
import type { ITestimonial } from "../types";

export default function TestimonialSection() {
    return (
        <div id="testimonials" className="px-4 md:px-16 lg:px-24 xl:px-32">
            <SectionTitle text1="Testimonials" text2="Loved by Creators" text3="See how our AI thumbnails are helping channels explode their views." />

            <div className="flex items-center justify-center py-5 overflow-hidden flex-wrap">
                {testimonialsData.map((testimonial: ITestimonial, index: number) => (
                    <TestimonialCard key={index} index={index} testimonial={testimonial} />
                ))}
            </div>
        </div>
    );
}